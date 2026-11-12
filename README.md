# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Running the app

The Groq API key must stay on the API server. Copy `saint-seiya-project/.env.example` to `saint-seiya-project/.env` and set `GROQ_API_KEY` there. Never put the key in a `VITE_` variable or the client `.env`; Vite variables are for public client configuration.

The client only needs the public API URL. Copy `.env.example` to `.env` if you need to change its default `VITE_API_URL`.

1. Start (or restart) the API server from `saint-seiya-project` with `npm start`.
2. Start the client from `saint-seiya-client` with `npm run dev`.

The client calls the API server, which uses the key to contact Groq. The local API server allows `http://localhost:5173` by default. AI-backed endpoints have per-IP rate limits.

## Deployment

- On Render, set `GROQ_API_KEY` as a secret environment variable and `CLIENT_ORIGINS` to the exact Vercel site origin, such as `https://your-app.vercel.app`. Separate multiple allowed origins with commas.
- On Vercel, set `VITE_API_URL` to the Render API base URL, such as `https://your-api.onrender.com`. Do not add the Groq key to Vercel.
- If you use Vercel preview deployments, add their exact origins to Render's `CLIENT_ORIGINS` only if they need API access.

CORS controls which browser origins may read API responses; it does not prevent non-browser clients from calling a public API. The AI endpoint limits are in-memory and reset when the server restarts, so use a shared rate-limit store if you later run multiple backend instances.

## War battle rules

Threat Cosmos ranges increase with each campaign battle, up to a maximum range of 160–260 on battle five. The server checks every battle against the active campaign's current range.

Battle outcomes are random but use the difference between a Saint's Cosmos and the threat's Required Cosmos. A stronger Saint is more likely to win, but never has a guaranteed victory. Saints facing a stronger threat also have a separate 20% chance to awaken their Cosmos. The War Records screen shows the estimated win chance and records the actual result.





