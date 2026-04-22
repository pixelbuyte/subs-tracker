import Link from 'next/link';

import { createSubscriptionAction } from '@/app/app/subscriptions/_actions';
import { SubscriptionForm } from '@/app/app/subscriptions/_components/subscription-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FREE_SUBSCRIPTION_LIMIT,
  getCurrentUserPlan,
  getCurrentUserSubscriptionCount,
} from '@/lib/plan/server';
import { hasWebsiteUrlColumn } from '@/lib/subscriptions/server';

export default async function NewSubscriptionPage() {
  const [websiteColumnExists, plan, usage] = await Promise.all([
    hasWebsiteUrlColumn(),
    getCurrentUserPlan(),
    getCurrentUserSubscriptionCount(),
  ]);

  const atLimit = plan.plan === 'free' && usage >= FREE_SUBSCRIPTION_LIMIT;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add subscription</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manual input now. Bank connections later.
          </p>
        </div>
        <Link href="/app">
          <Button variant="secondary">Back</Button>
        </Link>
      </div>

      {!websiteColumnExists ? (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
          <div className="font-medium">Website URL isn&apos;t saving yet.</div>
          <div className="mt-1 text-xs opacity-90">
            Run this one line in your Supabase SQL editor to enable brand logos:
          </div>
          <pre className="mt-2 overflow-x-auto rounded bg-amber-500/10 px-2 py-1.5 font-mono text-[11px]">
            alter table public.subscriptions add column if not exists website_url text;
          </pre>
        </div>
      ) : null}

      {atLimit ? (
        <Card className="border-indigo-500/40 bg-gradient-to-b from-indigo-500/10 to-fuchsia-500/5">
          <CardHeader>
            <CardTitle>You&apos;ve hit the Free plan limit</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <p className="text-[var(--muted-foreground)]">
              Free is capped at <strong className="text-foreground">{FREE_SUBSCRIPTION_LIMIT}</strong>{' '}
              subscriptions. Upgrade to <strong className="text-foreground">Pro ($8.99/mo)</strong>{' '}
              for unlimited subscriptions, renewal reminder emails, and trial tracking.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/app/settings">
                <Button>Upgrade to Pro</Button>
              </Link>
              <Link href="/app">
                <Button variant="secondary">Back to dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionForm mode="create" action={createSubscriptionAction} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
