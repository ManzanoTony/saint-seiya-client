# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Running the app

The Groq API key must be kept on the server. Copy `saint-seiya-project/.env.example` to `saint-seiya-project/.env` and set `GROQ_API_KEY` there. For existing setups, the API server also reads `VITE_GROQ_API_KEY` from `saint-seiya-client/.env` server-side, but moving it to the server `.env` is recommended.

1. Start (or restart) the API server from `saint-seiya-project` with `npm start`.
2. Start the client from `saint-seiya-client` with `npm run dev`.

The client does not send the key to the browser; it calls the API server, which uses the key to contact Groq.

## War battle rules

Threat Cosmos ranges increase with each campaign battle, up to a maximum range of 160–260 on battle five. The server checks every battle against the active campaign's current range.

Battle outcomes are random but use the difference between a Saint's Cosmos and the threat's Required Cosmos. A stronger Saint is more likely to win, but never has a guaranteed victory. Saints facing a stronger threat also have a separate 20% chance to awaken their Cosmos. The War Records screen shows the estimated win chance and records the actual result.





