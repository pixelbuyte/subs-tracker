'use client';

import * as React from 'react';
import { useActionState } from 'react';

import type { SubscriptionRow } from '@/lib/subscriptions/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { SubscriptionLogo } from '@/components/subscription-logo';
import { guessDomainFromName } from '@/lib/subscriptions/logo';
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

  const [name, setName] = React.useState(initial?.name ?? '');
  const [websiteUrl, setWebsiteUrl] = React.useState(initial?.website_url ?? '');
  const [urlTouched, setUrlTouched] = React.useState(Boolean(initial?.website_url));

  // When the user types a name for a known service, pre-fill the URL — but
  // only if they haven't typed one themselves yet.
  React.useEffect(() => {
    if (urlTouched) return;
    const guess = guessDomainFromName(name);
    setWebsiteUrl(guess ?? '');
  }, [name, urlTouched]);

  return (
    <form action={formAction} className="grid gap-4">
      {state.error ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      ) : null}

      {/* Live preview row */}
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-muted/40 p-3">
        <SubscriptionLogo name={name || 'Subscription'} websiteUrl={websiteUrl} size="lg" />
        <div className="min-w-0">
          <div className="truncate font-medium">{name || 'Your subscription'}</div>
          <div className="truncate text-xs text-[var(--muted-foreground)]">
            {websiteUrl
              ? `Logo from ${websiteUrl.replace(/^https?:\/\//i, '')}`
              : 'Add a website to show the real brand logo'}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Name</span>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Netflix"
          />
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

      <label className="grid gap-1 text-sm">
        <span className="flex items-center justify-between">
          <span className="text-[var(--muted-foreground)]">Website (optional)</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            We&apos;ll fetch the brand logo automatically
          </span>
        </span>
        <Input
          name="website_url"
          value={websiteUrl}
          onChange={(e) => {
            setWebsiteUrl(e.target.value);
            setUrlTouched(true);
          }}
          type="text"
          inputMode="url"
          placeholder="netflix.com"
          autoComplete="off"
        />
      </label>

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
