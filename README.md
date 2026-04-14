<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PreventX

This project is a Vite + React application with a small Express server for production hosting and secure AI proxying.

## Run Locally

Prerequisites: Node.js 20+

1. Install dependencies:
   `npm install`
2. Create `.env.local` using `.env.example`.
3. Set required variables:
   - `NVIDIA_API_KEY=your_nvidia_key`
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your_public_anon_key`
4. Start the app in development mode:
   `npm run dev`

## Production (Render)

This repository includes `render.yaml` so you can deploy with a Render Blueprint.

1. Push this repo to GitHub.
2. In Render, click **New +** → **Blueprint**.
3. Select your repo and confirm the detected service.
4. Set environment variables in Render:
   - `NVIDIA_API_KEY` (required)
   - `VITE_SUPABASE_URL` (required)
   - `VITE_SUPABASE_ANON_KEY` (required)
5. Deploy.

Render build/start used by this repo:

- Build command: `npm ci && npm run build`
- Start command: `npm run start`

## Security Notes

- `NVIDIA_API_KEY` is server-side only. It is never sent to the browser.
- Chat proxy endpoint is rate-limited and validates payload shape.
- Security headers are enforced by the Express server (CSP, HSTS, frame blocking, and MIME sniff prevention).
- Service worker is opt-in only via `VITE_ENABLE_SERVICE_WORKER=true`.
- If a key was previously committed, rotate it in the provider dashboard before deploying.
