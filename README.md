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

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
