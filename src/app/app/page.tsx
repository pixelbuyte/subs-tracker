import Link from 'next/link';

import { SubscriptionsDashboard } from '@/app/app/_components/subscriptions-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listSubscriptions } from '@/lib/subscriptions/server';

export default async function DashboardPage() {
  const subscriptions = await listSubscriptions();

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Your control panel for recurring spend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/export">
            <Button variant="secondary">Export CSV</Button>
          </Link>
          <Link href="/app/subscriptions/new">
            <Button>Add subscription</Button>
          </Link>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Getting started</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            Add your first subscription to see totals, renewal highlights, and category breakdowns.
          </CardContent>
        </Card>
      ) : (
        <SubscriptionsDashboard subscriptions={subscriptions} />
      )}
    </div>
  );
}

