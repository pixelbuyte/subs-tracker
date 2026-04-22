import Link from 'next/link';

import { SubscriptionsDashboard } from '@/app/app/_components/subscriptions-dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FREE_SUBSCRIPTION_LIMIT, getCurrentUserPlan } from '@/lib/plan/server';
import { listSubscriptions } from '@/lib/subscriptions/server';

export default async function DashboardPage() {
  const [subscriptions, plan] = await Promise.all([listSubscriptions(), getCurrentUserPlan()]);

  const usage = subscriptions.length;
  const atOrPastLimit = plan.plan === 'free' && usage >= FREE_SUBSCRIPTION_LIMIT;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Your control panel for recurring spend.
          </p>
          {plan.plan === 'free' ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-muted/60 px-2.5 py-0.5 text-xs">
              <span className="font-medium">Free</span>
              <span className="text-[var(--muted-foreground)]">
                {usage} / {FREE_SUBSCRIPTION_LIMIT}
              </span>
              <Link
                href="/app/settings"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Upgrade
              </Link>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-0.5 text-xs font-semibold text-white">
              Pro
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Link href="/app/export" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Export CSV
            </Button>
          </Link>
          <Link href="/app/subscriptions/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">Add subscription</Button>
          </Link>
        </div>
      </div>

      {atOrPastLimit ? (
        <div className="rounded-md border border-indigo-500/40 bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/5 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              You&apos;ve reached the Free plan limit of{' '}
              <strong>{FREE_SUBSCRIPTION_LIMIT}</strong> subscriptions.{' '}
              <span className="text-[var(--muted-foreground)]">
                Upgrade to Pro for unlimited + reminder emails.
              </span>
            </div>
            <Link href="/app/settings">
              <Button size="sm">Upgrade</Button>
            </Link>
          </div>
        </div>
      ) : null}

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
