'use client';

import * as React from 'react';
import { useActionState } from 'react';

import type { BillingCycle, SubscriptionRow } from '@/lib/subscriptions/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { SubscriptionLogo } from '@/components/subscription-logo';
import { deriveDomain, guessDomainFromName } from '@/lib/subscriptions/logo';
import { lookupPlatformCatalog, type PlatformPlan } from '@/lib/subscriptions/platform-catalog';
import type { ActionState } from '@/app/app/subscriptions/_actions';
import { cn } from '@/lib/utils';

function centsToMoneyString(cents: number) {
  return (cents / 100).toFixed(2);
}

function chipPriceLabel(plan: PlatformPlan) {
  if (plan.priceCents <= 0) return '$0';
  return `$${centsToMoneyString(plan.priceCents)}`;
}

function billingLabel(cycle: BillingCycle) {
  switch (cycle) {
    case 'monthly':
      return '/mo';
    case 'yearly':
      return '/yr';
    case 'weekly':
      return '/wk';
    case 'quarterly':
      return '/qtr';
    default:
      return '';
  }
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

  const [priceInput, setPriceInput] = React.useState(() =>
    initial ? centsToMoneyString(initial.price_cents) : '',
  );
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>(
    initial?.billing_cycle ?? 'monthly',
  );
  const [notes, setNotes] = React.useState(initial?.notes ?? '');
  const [category, setCategory] = React.useState(initial?.category ?? 'Other');
  const [appliedPlanId, setAppliedPlanId] = React.useState<string | null>(null);

  // When the user types a name for a known service, pre-fill the URL — but
  // only if they haven't typed one themselves yet.
  React.useEffect(() => {
    if (urlTouched) return;
    const guess = guessDomainFromName(name);
    setWebsiteUrl(guess ?? '');
  }, [name, urlTouched]);

  const catalogEntry = React.useMemo(() => {
    const host = deriveDomain(websiteUrl);
    return host ? lookupPlatformCatalog(host) : null;
  }, [websiteUrl]);

  React.useEffect(() => {
    if (!catalogEntry) {
      setAppliedPlanId(null);
      return;
    }
    setAppliedPlanId((prev) => {
      if (!prev) return prev;
      return catalogEntry.plans.some((p) => p.id === prev) ? prev : null;
    });
  }, [catalogEntry]);

  function applyPlan(plan: PlatformPlan) {
    if (!catalogEntry) return;
    setName(catalogEntry.displayName);
    setPriceInput(centsToMoneyString(plan.priceCents));
    setBillingCycle(plan.billingCycle);
    setNotes(
      `Plan: ${catalogEntry.displayName} — ${plan.label} (US price estimate — confirm in your region).`,
    );
    if (catalogEntry.defaultCategory) setCategory(catalogEntry.defaultCategory);
    setAppliedPlanId(plan.id);
  }

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
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
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
          placeholder="netflix.com or https://youtube.com/…"
          autoComplete="off"
        />
      </label>

      {catalogEntry ? (
        <div className="rounded-lg border border-[var(--border)] bg-muted/30 p-3 text-sm">
          <p className="font-medium text-foreground">
            Detected: {catalogEntry.displayName}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Prices are estimates; confirm in your account and region. Click a plan to fill the form.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {catalogEntry.plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                disabled={isPending}
                onClick={() => applyPlan(plan)}
                className={cn(
                  'inline-flex max-w-full flex-col items-start gap-0.5 rounded-md border px-3 py-2 text-left text-xs transition-colors',
                  'border-[var(--border)] bg-card hover:bg-muted/80',
                  appliedPlanId === plan.id &&
                    'ring-2 ring-[var(--ring)] border-indigo-500/50 dark:border-indigo-400/50',
                )}
              >
                <span className="font-medium text-foreground">{plan.label}</span>
                <span className="text-[var(--muted-foreground)]">
                  {chipPriceLabel(plan)}
                  {billingLabel(plan.billingCycle)}
                </span>
                {plan.hint ? (
                  <span className="text-[var(--muted-foreground)] opacity-90">{plan.hint}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Billing cycle</span>
          <Select
            name="billing_cycle"
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
            required
          >
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
          <Input
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--muted-foreground)]">Currency</span>
          <Input name="currency" defaultValue={initial?.currency ?? 'usd'} disabled />
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-[var(--muted-foreground)]">Notes</span>
        <Textarea
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional"
        />
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
