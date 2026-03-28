import os
from pathlib import Path
import sys

from dotenv import load_dotenv

_SERVER_DIR = Path(__file__).resolve().parents[1]
load_dotenv(_SERVER_DIR / '.env')

# Resolve fork root so ``import yt_dlp`` works when the API runs from ``web/server``.
_ROOT = Path(__file__).resolve().parents[3]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.download import router as download_router
from app.terminal import router as terminal_router

app = FastAPI(title='yt-dlp Web API', version='0.1.0')

_default_origins = ['http://127.0.0.1:5173', 'http://localhost:5173']
_extra = os.environ.get('YTDLP_CORS_ORIGINS', '').strip()
_cors_origins = [
    *[o.strip() for o in _extra.split(',') if o.strip()],
    *_default_origins,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(terminal_router, prefix='/api')
app.include_router(download_router, prefix='/api')


@app.get('/api/health')
def api_health() -> dict:
    return {'ok': True, 'version': app.version}


class PreviewBody(BaseModel):
    urls: list[str] = Field(min_length=1)


@app.post('/api/preview')
def api_preview(body: PreviewBody) -> dict:
    """Placeholder until YoutubeDL extract_info is wired."""
    return {
        'ok': True,
        'placeholder': True,
        'url_count': len(body.urls),
    }
