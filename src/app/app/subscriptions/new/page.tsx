import Link from 'next/link';

import { createSubscriptionAction } from '@/app/app/subscriptions/_actions';
import { SubscriptionForm } from '@/app/app/subscriptions/_components/subscription-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewSubscriptionPage() {
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

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionForm mode="create" action={createSubscriptionAction} />
        </CardContent>
      </Card>
    </div>
  );
}

