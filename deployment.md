# Deploying the yt-dlp Web UI (Render)

This fork ships two deployable pieces:

| Part | Directory | What it is |
|------|-----------|------------|
| **API** | Repo root + `web/server/` | FastAPI (`uvicorn`), runs `yt_dlp`, downloads, sanitized CLI |
| **Frontend** | `web/client/` | Vite + React static site (`dist/`) |

On Render you typically create **two services** from the **same Git repository**: one **Web Service** (Python) for the API, and one **Static Site** for the UI.

---

## 1. Backend — Render Web Service (Python)

### Settings (Dashboard)

| Field | Value |
|--------|--------|
| **Root Directory** | *(leave empty — repository root)* |
| **Runtime** | Python 3 |
| **Build Command** | See below |
| **Start Command** | See below |

### Build Command

Install the **fork** (so `import yt_dlp` works) with default downloader deps, then install the small web package:

```bash
pip install --upgrade pip && pip install -e ".[default]" && pip install -e web/server
```

### Start Command

Run uvicorn from `web/server` so `app.main:app` resolves. Render injects `PORT`:

```bash
cd web/server && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

(On Windows locally you use `127.0.0.1:8000`; in production `0.0.0.0` is required.)

### Environment variables (API)

| Variable | Required | Purpose |
|----------|----------|---------|
| `YTDLP_CORS_ORIGINS` | **Yes** (for separate static site) | Comma-separated browser origins allowed to call the API, e.g. `https://your-frontend.onrender.com` |
| `YTDLP_DOWNLOAD_DIR` | Optional | Absolute path for downloads. Default: `web/server/data/downloads` under the service (ephemeral on Render unless you attach a **disk**). |
| `YTDLP_ANALYTICS_DB` | Optional | SQLite path for first-party analytics (if you use the aggregation CLI on a scheduler). |

After the first deploy, copy the API URL (e.g. `https://ytdlp-api.onrender.com`). You will use it as **`VITE_API_BASE_URL`** for the frontend (no trailing slash).

### FFmpeg

Merging formats, embedding subtitles/thumbnails, and **Extract audio** need **FFmpeg** on the API machine. Render’s default Python build environment may **not** include it. If downloads fail with FFmpeg errors, use a **Docker**-based Web Service or another host where you can install FFmpeg. Plain HTTP progressive formats may still work without FFmpeg for some sites.

### Cold starts & timeouts

Free tier services **spin down**. Long `yt-dlp` jobs can hit HTTP timeouts if you later add synchronous endpoints; the current **background download** task runs after the response is returned, but very heavy use may still need a paid instance or a job queue.

---

## 2. Frontend — Render Static Site

### Settings (Dashboard)

| Field | Value |
|--------|--------|
| **Root Directory** | `web/client` |
| **Build Command** | `npm ci && npm run build` |
| **Publish Directory** | `dist` |

### Environment variables (build-time)

Vite only reads variables prefixed with `VITE_` **at build time**.

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_BASE_URL` | **Yes** (for split deploy) | `https://ytdlp-api.onrender.com` |

Do **not** include a trailing slash. Leave unset only if the UI and API are served from the **same origin** (e.g. one reverse proxy); then the app uses relative `/api/...` URLs.

After changing env vars, **trigger a new deploy** so the client rebuilds.

### Client-side routing (SPA)

Routes such as `/faq`, `/terminal`, etc. must fall back to `index.html`. In the Render dashboard for the static site, add a **redirect/rewrite** rule if previews show 404 on refresh:

- **Source:** `/*`
- **Destination:** `/index.html`
- **Action:** Rewrite (HTTP 200), not redirect

(`public/_redirects` is included for hosts that read it; confirm behavior for Render in their current static-site docs.)

---

## 3. Deployment order

1. Deploy the **API** Web Service; wait until it is live and `GET https://<api-host>/api/health` returns JSON with `"ok": true`.
2. Set **`YTDLP_CORS_ORIGINS`** to your **frontend** origin (exact scheme + host, no path).
3. Deploy the **Static Site** with **`VITE_API_BASE_URL`** set to the API origin.
4. Open the static URL and confirm the header shows **API connected**.

---

## 4. Security reminder (public URL)

The **sanitized terminal** and **downloads** run `yt-dlp` on your server. Treat the API as **privileged**: rate-limit at the edge if possible, monitor disk and `YTDLP_DOWNLOAD_DIR`, and avoid exposing internal URLs. Cookies, `--exec`, and similar paths remain blocked in the web terminal; downloads still use network and disk on your host.

---

## 5. Optional: analytics cron on Render

If you use the SQLite analytics module under `web/server/analytics/`, schedule a **Cron Job** or **Background Worker** to run nightly:

```bash
cd web/server && python -m analytics.cli
```

Set `YTDLP_ANALYTICS_DB` to a persistent path if you attach a disk.

---

## 6. Local parity (quick reference)

| Goal | Command |
|------|---------|
| API + UI together | From repo root: `npm run install:web` once, then `npm run dev` |
| API only | `npm run dev:server` |
| UI only | `npm run dev:client` |

Local CORS defaults include `localhost:5173`; production relies on **`YTDLP_CORS_ORIGINS`** and **`VITE_API_BASE_URL`**.
