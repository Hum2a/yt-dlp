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

export type TerminalRunResponse = {
  returncode: number;
  stdout: string;
  stderr: string;
  truncated: boolean;
  argv_display: string[];
};

export type DownloadStartResponse = {
  ok: boolean;
  accepted: boolean;
  url_count: number;
  audio_only: boolean;
  output_dir: string;
  log_file: string;
  message: string;
};

export async function postDownload(body: {
  urls: string[];
  audio_only?: boolean;
}): Promise<DownloadStartResponse> {
  const res = await fetch(`${API_PREFIX}/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: body.urls, audio_only: body.audio_only ?? false }),
  });
  const data = (await res.json().catch(() => ({}))) as DownloadStartResponse & { detail?: unknown };
  if (!res.ok) {
    const d = data.detail;
    const msg =
      typeof d === 'string'
        ? d
        : Array.isArray(d)
          ? d.map((x) => (typeof x === 'object' && x && 'msg' in x ? String((x as { msg: string }).msg) : '')).join(
              '; ',
            )
          : res.statusText;
    throw new Error(msg || 'Download request failed');
  }
  return data as DownloadStartResponse;
}

export async function postTerminalRun(line: string): Promise<TerminalRunResponse> {
  const res = await fetch(`${API_PREFIX}/terminal/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line }),
  });
  const data = (await res.json().catch(() => ({}))) as
    | TerminalRunResponse
    | { detail?: string | Array<{ msg?: string }> };
  if (!res.ok) {
    const d = (data as { detail?: unknown }).detail;
    const msg =
      typeof d === 'string'
        ? d
        : Array.isArray(d)
          ? d.map((x) => (typeof x === 'object' && x && 'msg' in x ? String(x.msg) : '')).join('; ')
          : res.statusText;
    throw new Error(msg || 'Request failed');
  }
  return data as TerminalRunResponse;
}
