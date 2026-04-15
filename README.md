# PreventX

PreventX is a Vite + React + TypeScript health screening app with AI chat guidance and optional Supabase-backed user data sync.

It focuses on early risk screening for:
- Diabetes
- Hypertension
- Anemia

This is a risk-screening tool, not a medical diagnosis system.

## Quick Start

Prerequisite: Node.js 20+

1. Install dependencies:
   npm install
2. Create .env.local from .env.example
3. Set required variables:
   - NVIDIA_API_KEY
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
4. Start development server:
   npm run dev

## Production (Render)

This repository includes render.yaml for Render Blueprint deployment.

1. Push this repo to GitHub.
2. In Render, create a new Blueprint service.
3. Select this repo.
4. Set environment variables in Render:
   - NVIDIA_API_KEY (required)
   - VITE_SUPABASE_URL (required)
   - VITE_SUPABASE_ANON_KEY (required)
5. Deploy.

Build command:
- npm ci && npm run build

Start command:
- npm run start

## Architecture Notes

- Frontend SPA: React + Vite + TypeScript
- Prediction engine: client-side in src/lib/mlEngine.ts
- AI chat adapter: src/lib/ai.ts
- Supabase client/auth/storage helpers: src/lib/supabase.ts
- Production server and secure AI proxy: server.mjs

## Security Notes

- NVIDIA_API_KEY is server-side only and should never be committed.
- Keep secrets in environment variables, not source files.
- If a key was exposed previously, rotate it before deployment.
- Service worker is opt-in via VITE_ENABLE_SERVICE_WORKER=true.
