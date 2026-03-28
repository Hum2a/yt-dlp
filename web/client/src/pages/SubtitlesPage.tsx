import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SubtitlesPage() {
  return (
    <>
      <PageHeader
        title="Subtitles"
        description="Subtitle languages, auto-captions, and embed vs external files (--sub-langs, --write-subs, --embed-subs, etc.)."
      />
      <Card>
        <CardHeader>
          <CardTitle>Subtitles</CardTitle>
          <CardDescription>Wire these checkboxes and inputs to the Python allowlisted options.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Checkbox id="write-subs" disabled />
            <Label htmlFor="write-subs" className="text-muted-foreground font-normal">
              Write subtitle files
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="embed-subs" disabled />
            <Label htmlFor="embed-subs" className="text-muted-foreground font-normal">
              Embed subtitles in video
            </Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sub-langs">Languages</Label>
            <Input id="sub-langs" placeholder="en.*,ja" disabled className="font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
