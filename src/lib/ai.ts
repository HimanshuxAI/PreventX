import { PredictionResults } from './mlEngine';

/**
 * PreventX AI Service (Minimax AI via NVIDIA NIM)
 * Calls a same-origin backend proxy endpoint.
 */
const SYSTEM_PROMPT = `You are "AarogyaShield AI", a professional medical health coach built for the PreventX platform.
Your goal is to provide personalized, non-invasive health guidance to users in rural and urban India.

GUIDELINES:
1. TONE: Professional, empathetic, and culturally aware.
2. LANGUAGES: Use the language the user speaks (primarily English, Hindi, or Marathi). Use simple, clear language.
3. CONTEXT: You will receive the user's latest health assessment results (risk scores for Diabetes, Hypertension, and Anemia). Use these to provide specific advice.
4. MEDICAL ADVICE: You are an AI, NOT a doctor. You must never diagnose.
5. RECOMMENDATIONS: 
   - Suggest dietary changes based on Indian staples (lentils, locally available greens, etc.).
   - Recommend light exercise like "Yoga" or "Walking".
   - If risk is HIGH or CRITICAL, insistently ask the user to visit their nearest "Primary Health Center (PHC)" or "Asha Worker".
6. WHAT-IF: You can suggest "What-If" scenarios (e.g., "If you reduce salt, your hypertension risk might drop by 15%").

Keep responses concise and formatted for a mobile interface (use bullet points).`;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function* streamChat(
  messages: ChatMessage[],
  latestResults?: PredictionResults | null
) {
  const contextMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...(latestResults ? [{
      role: 'system' as const,
      content: `LATEST ASSESSMENT DATA:
      - Diabetes Risk: ${latestResults.diabetes.risk}% (${latestResults.diabetes.severity})
      - Hypertension Risk: ${latestResults.hypertension.risk}% (${latestResults.hypertension.severity})
      - Anemia Risk: ${latestResults.anemia.risk}% (${latestResults.anemia.severity})
      - Key Risk Factors: ${latestResults.diabetes.shapFeatures.map(f => f.name).join(', ')}`
    }] : []),
    ...messages
  ];

  try {
    // In development, Vite proxies this route. In production, Express handles it.
    const response = await fetch('/api/nvidia/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "minimaxai/minimax-m2.7",
        messages: contextMessages,
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 1024,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("NVIDIA API error:", response.status, errText);
      yield "I apologize, but I'm having trouble connecting right now. Please try again or visit your local health worker.";
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      yield "Streaming not supported in this browser.";
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    // Accumulate full text to strip <think> blocks reliably
    let fullText = '';
    let lastYieldedLen = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process SSE lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const data = trimmed.slice(6);
        if (data === '[DONE]') {
          // Final flush
          const cleaned = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
          const remaining = cleaned.slice(lastYieldedLen);
          if (remaining) yield remaining;
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content || '';
          if (content) {
            fullText += content;

            // Only yield text that's outside <think> blocks and already "closed"
            const cleaned = fullText.replace(/<think>[\s\S]*?<\/think>/g, '');
            
            // Check if we're inside an unclosed <think> block
            const lastThinkOpen = cleaned.lastIndexOf('<think>');
            const lastThinkClose = cleaned.lastIndexOf('</think>');
            const isInsideThink = lastThinkOpen > lastThinkClose;
            
            if (!isInsideThink) {
              // Safe to yield up to the cleaned text
              const safeText = cleaned.trim();
              const newContent = safeText.slice(lastYieldedLen);
              if (newContent) {
                yield newContent;
                lastYieldedLen = safeText.length;
              }
            }
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
    
    // Final cleanup for any remaining text
    const cleaned = fullText.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
    const remaining = cleaned.slice(lastYieldedLen);
    if (remaining) yield remaining;
  } catch (error) {
    console.error("AI Error:", error);
    yield "I apologize, but I'm having trouble connecting to my medical database. Please try again or visit your local health worker.";
  }
}
