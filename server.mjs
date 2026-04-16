import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

const app = express();
const port = Number(process.env.PORT || 10000);
const nvidiaApiKey = process.env.NVIDIA_API_KEY;
const chatRateBuckets = new Map();

const CHAT_RATE_WINDOW_MS = 60_000;
const CHAT_RATE_MAX_REQUESTS = 30;
const CHAT_MAX_MESSAGES = 24;
const CHAT_MAX_MESSAGE_LENGTH = 2000;
const CHAT_MAX_TOKENS = 4096;
const ALLOWED_MODELS = new Set(['google/gemma-2-2b-it', 'nvidia/nemotron-nano-12b-v2-vl', 'minimaxai/minimax-m2.7']);
const ALLOWED_ROLES = new Set(['system', 'user', 'assistant']);

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), geolocation=(), microphone=(), payment=(), usb=()');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  if (req.secure || req.get('x-forwarded-proto') === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
});

app.use(express.json({ limit: '10mb', type: ['application/json'] }));

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function cleanupRateBuckets(now) {
  for (const [ip, bucket] of chatRateBuckets.entries()) {
    if (bucket.resetAt <= now) {
      chatRateBuckets.delete(ip);
    }
  }
}

function applyChatRateLimit(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const existing = chatRateBuckets.get(ip);

  if (!existing || existing.resetAt <= now) {
    chatRateBuckets.set(ip, { count: 1, resetAt: now + CHAT_RATE_WINDOW_MS });
    if (chatRateBuckets.size > 1024) cleanupRateBuckets(now);
    next();
    return;
  }

  if (existing.count >= CHAT_RATE_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfterSeconds));
    res.status(429).json({ error: 'Too many requests. Please retry shortly.' });
    return;
  }

  existing.count += 1;
  next();
}

function normalizeChatPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid payload.' };
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, error: 'messages is required.' };
  }

  if (body.messages.length > CHAT_MAX_MESSAGES) {
    return { ok: false, error: `Too many messages. Max allowed is ${CHAT_MAX_MESSAGES}.` };
  }

  const messages = [];
  for (const item of body.messages) {
    if (!item || typeof item !== 'object') {
      return { ok: false, error: 'Invalid message entry.' };
    }

    const role = typeof item.role === 'string' ? item.role : '';
    let content = item.content;

    if (!ALLOWED_ROLES.has(role)) {
      return { ok: false, error: `Invalid message role: ${role || 'unknown'}.` };
    }

    if (typeof content === 'string') {
      content = content.trim();
      if (!content) continue;
      if (content.length > CHAT_MAX_MESSAGE_LENGTH) {
        return {
          ok: false,
          error: `Message too long. Limit is ${CHAT_MAX_MESSAGE_LENGTH} characters.`,
        };
      }
    } else if (Array.isArray(content)) {
      // Vision payload array support
      if (content.length === 0) continue;
    } else {
      continue;
    }

    messages.push({ role, content });
  }

  if (messages.length === 0) {
    return { ok: false, error: 'No valid message content provided.' };
  }

  const finalModel = ALLOWED_MODELS.has(body.model) ? body.model : 'google/gemma-2-2b-it';

  return {
    ok: true,
    payload: {
      model: finalModel,
      messages,
      temperature: clampNumber(body.temperature, 0, 1, 0.7),
      top_p: clampNumber(body.top_p, 0, 1, 0.95),
      max_tokens: Math.floor(clampNumber(body.max_tokens, 64, CHAT_MAX_TOKENS, CHAT_MAX_TOKENS)),
      stream: true,
    },
  };
}

app.get('/healthz', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.post('/api/nvidia/chat/completions', applyChatRateLimit, async (req, res) => {
  if (!nvidiaApiKey) {
    res.status(500).json({
      error: 'Server is missing NVIDIA_API_KEY environment variable.',
    });
    return;
  }

  const origin = req.get('origin');
  const host = req.get('host');
  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
        return;
      }
    } catch {
      res.status(400).json({ error: 'Invalid origin header.' });
      return;
    }
  }

  const normalized = normalizeChatPayload(req.body);
  if (!normalized.ok) {
    res.status(400).json({ error: normalized.error });
    return;
  }

  const controller = new AbortController();
  req.on('close', () => controller.abort());

  try {
    const upstream = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nvidiaApiKey}`,
      },
      body: JSON.stringify(normalized.payload),
      signal: controller.signal,
    });

    const contentType = upstream.headers.get('content-type') || 'application/json';
    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Accel-Buffering', 'no');

    if (!upstream.body) {
      const text = await upstream.text();
      res.send(text);
      return;
    }

    if (contentType.includes('text/event-stream')) {
      res.setHeader('Connection', 'keep-alive');
      Readable.fromWeb(upstream.body).pipe(res);
      return;
    }

    const text = await upstream.text();
    res.send(text);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return;
    }

    console.error('NVIDIA proxy error:', error);
    res.status(502).json({
      error: 'Unable to reach NVIDIA service.',
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'dist');
const assetsDir = path.join(distDir, 'assets');

app.use('/assets', express.static(assetsDir, {
  immutable: true,
  maxAge: '1y',
  index: false,
}));

app.use(express.static(distDir, {
  index: false,
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

// SPA fallback for client-side navigation.
app.get('*', (_req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`PreventX server listening on port ${port}`);
});
