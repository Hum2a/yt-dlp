import { useMemo, useState } from 'react';

import { postDownload, postPreview } from '@/api/client';
import { DownloadOptionsForm } from '@/components/DownloadOptionsForm';
import { PageHeader } from '@/components/PageHeader';
import { YouTubeEmbedCard } from '@/components/YouTubeEmbedCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { defaultDownloadOptions, downloadOptionsToApiPayload } from '@/lib/downloadOptions';
import { firstYoutubeIdFromText } from '@/lib/youtube';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function parseUrls(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function HomePage() {
  const [urls, setUrls] = useState('');
  const [dlOptions, setDlOptions] = useState(defaultDownloadOptions);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewJson, setPreviewJson] = useState<string | null>(null);
  const [downloadInfo, setDownloadInfo] = useState<string | null>(null);

  const youtubeId = useMemo(() => firstYoutubeIdFromText(urls), [urls]);

  async function onPreview() {
    const list = parseUrls(urls);
    setError(null);
    setPreviewJson(null);
    if (list.length === 0) {
      setError('Add at least one URL (one per line).');
      return;
    }
    setLoading(true);
    try {
      const res = await postPreview({ urls: list });
      const text = await res.text();
      if (!res.ok) {
        setError(text || `Preview failed (${res.status})`);
        return;
      }
      try {
        const data = JSON.parse(text) as unknown;
        setPreviewJson(JSON.stringify(data, null, 2));
      } catch {
        setPreviewJson(text);
      }
    } catch {
      setError('Could not reach the API. Is the server running?');
    } finally {
      setLoading(false);
    }
  }

  async function onDownload() {
    const list = parseUrls(urls);
    setError(null);
    setDownloadInfo(null);
    if (list.length === 0) {
      setError('Add at least one URL (one per line).');
      return;
    }
    setDownloadLoading(true);
    try {
      const options = downloadOptionsToApiPayload(dlOptions);
      const data = await postDownload({ urls: list, options });
      setDownloadInfo(
        JSON.stringify(
          {
            message: data.message,
            output_dir: data.output_dir,
            log_file: data.log_file,
            url_count: data.url_count,
            options_sent: options,
          },
          null,
          2,
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Download request failed');
    } finally {
      setDownloadLoading(false);
    }
  }

  const hasUrls = parseUrls(urls).length > 0;

  return (
    <>
      <PageHeader
        title="Download"
        description="Paste URLs, tune yt-dlp options below, and start a background download. YouTube links show an embedded preview when we can parse a video ID."
      />

      <Card>
        <CardHeader>
          <CardTitle>URLs</CardTitle>
          <CardDescription>One URL per line. Blank lines are ignored.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="urls">Target URLs</Label>
            <Textarea
              id="urls"
              placeholder="https://www.youtube.com/watch?v=…"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              className="font-mono text-xs"
            />
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onPreview} disabled={loading || downloadLoading}>
              {loading ? 'Preview…' : 'Preview'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onDownload}
              disabled={!hasUrls || downloadLoading || loading}
            >
              {downloadLoading ? 'Starting…' : 'Download'}
            </Button>
          </div>
          {downloadInfo ? (
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium">Download started</p>
              <pre
                className={cn(
                  'max-h-64 overflow-auto rounded-md border bg-muted/30 p-3',
                  'font-mono text-xs leading-relaxed',
                )}
              >
                {downloadInfo}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {youtubeId ? (
        <div className="mt-6">
          <YouTubeEmbedCard videoId={youtubeId} />
        </div>
      ) : null}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Download options</CardTitle>
          <CardDescription>
            These map to an allowlisted subset of{' '}
            <code className="text-xs">YoutubeDL</code> parameters on the server. More flags exist on the FAQ page;
            ask to expose any you need.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DownloadOptionsForm value={dlOptions} onChange={setDlOptions} />
        </CardContent>
      </Card>

      {previewJson ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Preview response</CardTitle>
            <CardDescription>Raw JSON from POST /api/preview.</CardDescription>
          </CardHeader>
          <CardContent>
            <pre
              className={cn(
                'max-h-[min(420px,50dvh)] overflow-auto rounded-md border bg-muted/30 p-4',
                'font-mono text-xs leading-relaxed',
              )}
            >
              {previewJson}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
