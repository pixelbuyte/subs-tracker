import Link from 'next/link';

import { updateSubscriptionAction, deleteSubscriptionAction } from '@/app/app/subscriptions/_actions';
import { SubscriptionForm } from '@/app/app/subscriptions/_components/subscription-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSubscriptionById, hasWebsiteUrlColumn } from '@/lib/subscriptions/server';

export default async function EditSubscriptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [subscription, websiteColumnExists] = await Promise.all([
    getSubscriptionById(id),
    hasWebsiteUrlColumn(),
  ]);
  const action = updateSubscriptionAction.bind(null, id);

  async function deleteAction() {
    'use server';
    await deleteSubscriptionAction(id);
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit subscription</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Update details or mark as cancelled.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <form action={deleteAction}>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </form>
          <Link href="/app">
            <Button variant="secondary">Back</Button>
          </Link>
        </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm mode="edit" initial={subscription} action={action} />
        </CardContent>
      </Card>
    </div>
  );
}

