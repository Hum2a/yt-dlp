# Web UI (`web/`)

Browser UI and API that live alongside the upstream-style **`yt_dlp`** package in this repo.

| Directory | Stack | Notes |
|-----------|--------|--------|
| **`client/`** | Vite, React, TypeScript, Tailwind | Dev server proxies `/api` to the backend. |
| **`server/`** | FastAPI, uvicorn | Serves REST routes; runs `yt_dlp` for downloads and the sanitized CLI. |

## Documentation

- **Local setup, features overview, scripts:** [README.md § Web UI](../README.md#web-ui) (repository root).
- **Production (Render, env vars, FFmpeg, SPA routing):** [deployment.md](../deployment.md).
- **Env templates:** [`client/.env.example`](client/.env.example), [`server/.env.example`](server/.env.example).

## Commands (from repository root)

```bash
npm run install:web    # once: npm deps + web/server .venv
npm run dev            # client + server
```

Do not commit real `.env` files; they are gitignored under `client/` and `server/`.
