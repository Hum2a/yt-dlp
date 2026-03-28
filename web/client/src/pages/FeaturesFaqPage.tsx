import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '@/components/PageHeader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
type CatalogOption = {
  flags: string[];
  dest: string | null;
  metavar: string | null;
  help: string;
  action: string;
  type: string | null;
  takes_value: boolean;
};

type CatalogGroup = {
  title: string;
  description: string;
  options: CatalogOption[];
};

type Catalog = {
  yt_dlp_version: string;
  groups: CatalogGroup[];
  ungrouped: CatalogOption[];
  option_count: number;
};

function OptionBlock({ opt }: { opt: CatalogOption }) {
  const flags = opt.flags.length ? opt.flags.join(', ') : '(positional / internal)';
  return (
    <div className="border-border rounded-lg border bg-muted/20 px-3 py-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <code className="text-foreground text-xs font-medium">{flags}</code>
        {opt.metavar ? (
          <span className="text-muted-foreground text-xs">[{opt.metavar}]</span>
        ) : null}
        {opt.dest ? (
          <span className="text-muted-foreground/80 text-[0.65rem]">dest={opt.dest}</span>
        ) : null}
      </div>
      {opt.help ? (
        <p className="mt-1.5 whitespace-pre-wrap text-xs leading-relaxed">{opt.help}</p>
      ) : (
        <p className="text-muted-foreground mt-1 text-xs italic">No help text.</p>
      )}
    </div>
  );
}

export function FeaturesFaqPage() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/ytdlp-cli-catalog.json');
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = (await res.json()) as Catalog;
        if (!cancelled) {
          setCatalog(data);
        }
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load catalog');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!catalog) {
      return null;
    }
    const q = query.trim().toLowerCase();
    if (!q) {
      return catalog.groups;
    }
    return catalog.groups
      .map((g) => ({
        ...g,
        options: g.options.filter(
          (o) =>
            o.help.toLowerCase().includes(q) ||
            (o.dest && o.dest.toLowerCase().includes(q)) ||
            o.flags.some((f) => f.toLowerCase().includes(q)),
        ),
      }))
      .filter((g) => g.options.length > 0);
  }, [catalog, query]);

  return (
    <>
      <PageHeader
        title="Features & CLI reference"
        description="Every command-line flag from this fork’s yt-dlp build (same groups as --help). Site extractors, format availability, and FFmpeg still affect what actually works at runtime."
      />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About this list</CardTitle>
          <CardDescription>
            Regenerated from <code className="text-xs">yt_dlp.options.create_parser()</code> when you run{' '}
            <code className="text-xs">npm run build</code> in the client (or{' '}
            <code className="text-xs">npm run generate:catalog</code> from the repo root). Many features also
            need <strong>FFmpeg</strong> on the machine where yt-dlp runs.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          {catalog ? (
            <p>
              Catalog version: <span className="text-foreground font-mono">{catalog.yt_dlp_version}</span> —{' '}
              <span className="text-foreground">{catalog.option_count}</span> options in{' '}
              <span className="text-foreground">{catalog.groups.length}</span> groups (plus ungrouped entries in
              JSON if any).
            </p>
          ) : loadError ? (
            <p className="text-destructive">
              Could not load <code className="text-xs">ytdlp-cli-catalog.json</code>: {loadError}. Run{' '}
              <code className="text-xs">npm run generate:catalog</code> from the yt-dlp repo root, then refresh.
            </p>
          ) : (
            <p>Loading catalog…</p>
          )}
        </CardContent>
      </Card>

      <div className="mb-4 space-y-2">
        <Label htmlFor="faq-search">Search flags and help text</Label>
        <Input
          id="faq-search"
          placeholder="e.g. format, subtitle, sponsorblock…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
      </div>

      {filtered && filtered.length > 0 ? (
        <Accordion type="multiple" className="w-full">
          {filtered.map((group) => (
            <AccordionItem key={group.title} value={group.title}>
              <AccordionTrigger className="text-left">
                <span>
                  {group.title}
                  <span className="text-muted-foreground ml-2 font-normal">
                    ({group.options.length} option{group.options.length === 1 ? '' : 's'})
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {group.description ? (
                  <p className="text-muted-foreground mb-3 text-xs italic">{group.description}</p>
                ) : null}
                <div className="space-y-2">
                  {group.options.map((opt, i) => (
                    <OptionBlock key={`${group.title}-${opt.dest ?? ''}-${i}`} opt={opt} />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : filtered && filtered.length === 0 ? (
        <p className="text-muted-foreground text-sm">No options match your search.</p>
      ) : null}

      {catalog && catalog.ungrouped.length > 0 ? (
        <>
          <Separator className="my-8" />
          <h2 className="mb-3 text-lg font-semibold">Ungrouped options</h2>
          <div className="space-y-2">
            {catalog.ungrouped.map((opt, i) => (
              <OptionBlock key={`ungrouped-${i}`} opt={opt} />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}
