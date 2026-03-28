import { useState } from 'react';

import { postTerminalRun } from '@/api/client';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function TerminalPage() {
  const [line, setLine] = useState('yt-dlp --version');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof postTerminalRun>> | null>(null);

  async function onRun() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const r = await postTerminalRun(line);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="CLI (sanitized)"
        description="Run yt-dlp on the server with strict validation: no shell, no cookies or batch files from disk, no --exec, no config/plugin injection, and only http(s) URLs as positionals."
      />

      <Card className="mb-6 border-amber-500/25 bg-amber-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Security</CardTitle>
          <CardDescription className="text-muted-foreground">
            Input is parsed with Python <code className="text-xs">shlex</code>, validated with yt-dlp’s real{' '}
            <code className="text-xs">optparse</code> parser, then executed as{' '}
            <code className="text-xs">python -m yt_dlp …</code> with a timeout and output cap. This is still
            powerful (network, CPU, disk in the download directory); use only on hosts you trust.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Command</CardTitle>
          <CardDescription>
            Prefix with <code className="text-xs">yt-dlp</code> or <code className="text-xs">python -m yt_dlp</code>,
            or paste flags only (same as after <code className="text-xs">yt-dlp</code>).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="min-h-[100px] font-mono text-xs"
            spellCheck={false}
            aria-label="yt-dlp command"
          />
          <Button type="button" onClick={onRun} disabled={loading}>
            {loading ? 'Running…' : 'Run'}
          </Button>
          {error ? (
            <p className="text-destructive border-destructive/30 rounded-md border px-3 py-2 text-sm">{error}</p>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Result</CardTitle>
            <CardDescription>
              Exit <code className="text-xs">{result.returncode}</code>
              {result.truncated ? ' — output truncated' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium">Effective argv</p>
              <pre className="bg-muted/30 max-h-24 overflow-auto rounded-md border p-3 font-mono text-xs">
                {result.argv_display.join(' ')}
              </pre>
            </div>
            {result.stdout ? (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">stdout</p>
                <pre
                  className={cn(
                    'bg-muted/30 max-h-[min(360px,45dvh)] overflow-auto rounded-md border p-3',
                    'font-mono text-xs leading-relaxed whitespace-pre-wrap',
                  )}
                >
                  {result.stdout}
                </pre>
              </div>
            ) : null}
            {result.stderr ? (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium">stderr</p>
                <pre
                  className={cn(
                    'bg-muted/30 max-h-[min(360px,45dvh)] overflow-auto rounded-md border p-3',
                    'font-mono text-xs leading-relaxed whitespace-pre-wrap text-amber-200/90',
                  )}
                >
                  {result.stderr}
                </pre>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </>
  );
}
