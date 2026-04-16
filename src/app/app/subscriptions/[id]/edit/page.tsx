import Link from 'next/link';

import { updateSubscriptionAction, deleteSubscriptionAction } from '@/app/app/subscriptions/_actions';
import { SubscriptionForm } from '@/app/app/subscriptions/_components/subscription-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSubscriptionById } from '@/lib/subscriptions/server';

export default async function EditSubscriptionPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const subscription = await getSubscriptionById(id);
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

