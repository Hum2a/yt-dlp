const API_PREFIX = '/api';

export type ApiHealth = {
  ok: true;
  version?: string;
};

export async function fetchHealth(signal?: AbortSignal): Promise<ApiHealth | null> {
  try {
    const res = await fetch(`${API_PREFIX}/health`, { signal });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as ApiHealth;
    return data.ok ? data : null;
  } catch {
    return null;
  }
}

export async function postPreview(
  body: { urls: string[] },
  signal?: AbortSignal,
): Promise<Response> {
  return fetch(`${API_PREFIX}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
}
