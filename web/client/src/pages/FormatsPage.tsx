import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function FormatsPage() {
  return (
    <>
      <PageHeader
        title="Formats"
        description="Controls format selection, sorting, and merge behavior (yt-dlp --format, --format-sort, merge flags). The API will translate these fields into YoutubeDL params."
      />
      <Card>
        <CardHeader>
          <CardTitle>Format selection</CardTitle>
          <CardDescription>Presets will map to common format strings; advanced users can edit the raw selector.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preset">Preset</Label>
            <select
              id="preset"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 text-sm shadow-sm"
              defaultValue="best"
              disabled
            >
              <option value="best">Best available (default)</option>
              <option value="1080">Best ≤ 1080p</option>
              <option value="audio">Audio only</option>
            </select>
            <p className="text-muted-foreground text-xs">Enable when the API accepts format presets.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="format">Custom format string</Label>
            <Input
              id="format"
              placeholder="bv*+ba/b"
              disabled
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
