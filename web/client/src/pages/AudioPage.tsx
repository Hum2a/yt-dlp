import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AudioPage() {
  return (
    <>
      <PageHeader
        title="Audio & post-processing"
        description="Extract audio, choose codec/container (--extract-audio, --audio-format, FFmpeg postprocessors). Requires FFmpeg where applicable."
      />
      <Card>
        <CardHeader>
          <CardTitle>Audio extraction</CardTitle>
          <CardDescription>FFmpeg-based steps run server-side after download.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audio-format">Audio format</Label>
            <Input id="audio-format" placeholder="mp3, m4a, opus…" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audio-quality">Quality (kbps or VBR hint)</Label>
            <Input id="audio-quality" placeholder="192" disabled />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
