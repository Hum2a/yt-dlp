import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  videoId: string;
  title?: string;
};

export function YouTubeEmbedCard({ videoId, title }: Props) {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0`;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Preview</CardTitle>
        <CardDescription>
          {title ?? 'Embedded player for the first YouTube URL above.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-0">
        <div className="bg-background aspect-video w-full">
          <iframe
            title="YouTube video preview"
            src={src}
            className="size-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </CardContent>
    </Card>
  );
}
