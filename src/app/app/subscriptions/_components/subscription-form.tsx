'use client';

import * as React from 'react';
import { useActionState } from 'react';

import type { SubscriptionRow } from '@/lib/subscriptions/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import type { ActionState } from '@/app/app/subscriptions/_actions';

function centsToMoneyString(cents: number) {
  return (cents / 100).toFixed(2);
}

export function SubscriptionForm({
  mode,
  initial,
  action,
}: {
  mode: 'create' | 'edit';
  initial?: SubscriptionRow;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Name</span>
          <Input name="name" defaultValue={initial?.name ?? ''} required placeholder="Netflix" />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Price</span>
          <Input
            name="price"
            inputMode="decimal"
            defaultValue={initial ? centsToMoneyString(initial.price_cents) : ''}
            required
            placeholder="12.99"
          />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Billing cycle</span>
          <Select name="billing_cycle" defaultValue={initial?.billing_cycle ?? 'monthly'} required>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="weekly">Weekly</option>
            <option value="quarterly">Quarterly</option>
          </Select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Next renewal</span>
          <Input
            name="next_renewal_date"
            type="date"
            defaultValue={initial?.next_renewal_date ?? ''}
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Status</span>
          <Select name="status" defaultValue={initial?.status ?? 'active'} required>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Category</span>
          <Input name="category" defaultValue={initial?.category ?? 'Other'} required />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Currency</span>
          <Input name="currency" defaultValue={initial?.currency ?? 'usd'} disabled />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-[var(--muted-foreground)]">Notes</span>
        <Textarea name="notes" defaultValue={initial?.notes ?? ''} placeholder="Optional" />
      </label>

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--muted-foreground)]">
          {mode === 'create' ? 'You can edit anytime.' : 'Changes save when you submit.'}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Spinner className="size-4" /> : null}
          {mode === 'create' ? 'Create subscription' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}

