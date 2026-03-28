import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export function AdvancedPage() {
  return (
    <>
      <PageHeader
        title="Advanced"
        description="Optional JSON blob of allowlisted YoutubeDL params for power users. Never send arbitrary shell or exec options from a public form."
      />
      <Card>
        <CardHeader>
          <CardTitle>Extra options (JSON)</CardTitle>
          <CardDescription>Server must validate keys against an allowlist before constructing YoutubeDL().</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder={'{\n  "noplaylist": true\n}'}
            disabled
            className="min-h-[200px] font-mono text-xs"
          />
        </CardContent>
      </Card>
    </>
  );
}
