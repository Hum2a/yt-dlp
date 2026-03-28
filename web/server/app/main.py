from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title='yt-dlp Web API', version='0.1.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://127.0.0.1:5173', 'http://localhost:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


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
