import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function JobsPage() {
  return (
    <>
      <PageHeader
        title="Jobs"
        description="Queued and active downloads with progress and logs. Populated once the API streams job events (SSE or WebSocket)."
      />
      <Card>
        <CardHeader>
          <CardTitle>No jobs yet</CardTitle>
          <CardDescription>Start a download from the Download page when the backend is ready.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This area will list job id, status, percent, and recent log lines.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
