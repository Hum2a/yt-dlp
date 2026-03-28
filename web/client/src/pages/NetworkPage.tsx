import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function NetworkPage() {
  return (
    <>
      <PageHeader
        title="Network"
        description="Proxy, socket timeout, and geo bypass (--proxy, --socket-timeout, etc.). Only expose safe, allowlisted options on a public deployment."
      />
      <Card>
        <CardHeader>
          <CardTitle>Connection</CardTitle>
          <CardDescription>Values are passed through to yt-dlp after server validation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proxy">Proxy URL</Label>
            <Input id="proxy" type="url" placeholder="http://host:port" disabled className="font-mono text-xs" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="socket-timeout">Socket timeout (seconds)</Label>
            <Input id="socket-timeout" type="number" placeholder="30" disabled />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
