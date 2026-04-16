import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Spinner /> Loading dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-[var(--muted-foreground)]">
        Pulling your latest subscriptions…
      </CardContent>
    </Card>
  );
}

