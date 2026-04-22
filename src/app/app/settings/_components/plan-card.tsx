'use client';

import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

type PlanCardProps = {
  plan: 'free' | 'pro';
  usage: number;
  limit: number;
  hasStripeCustomer: boolean;
  currentPeriodEnd: string | null;
  stripeConfigured: boolean;
  initialFlash?: 'success' | 'cancelled' | null;
};

export function PlanCard({
  plan,
  usage,
  limit,
  hasStripeCustomer,
  currentPeriodEnd,
  stripeConfigured,
  initialFlash,
}: PlanCardProps) {
  const [loading, setLoading] = React.useState<'checkout' | 'portal' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [flash, setFlash] = React.useState<'success' | 'cancelled' | null>(initialFlash ?? null);

  async function go(path: string, kind: 'checkout' | 'portal') {
    setLoading(kind);
    setError(null);
    try {
      const res = await fetch(path, { method: 'POST' });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? `Request failed (${res.status})`);
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setLoading(null);
    }
  }

  const renewLabel = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        {flash === 'success' ? (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-700 dark:text-emerald-300">
            You&apos;re on <strong>Pro</strong>. Thanks — enjoy unlimited subscriptions + reminder emails.
            <button
              type="button"
              className="ml-2 underline underline-offset-2 opacity-80 hover:opacity-100"
              onClick={() => setFlash(null)}
            >
              dismiss
            </button>
          </div>
        ) : null}
        {flash === 'cancelled' ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
            Checkout cancelled. No charge was made.
            <button
              type="button"
              className="ml-2 underline underline-offset-2 opacity-80 hover:opacity-100"
              onClick={() => setFlash(null)}
            >
              dismiss
            </button>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              plan === 'pro'
                ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white'
                : 'bg-muted text-[var(--muted-foreground)]'
            }`}
          >
            {plan === 'pro' ? 'Pro' : 'Free'}
          </span>
          {plan === 'free' ? (
            <span className="text-[var(--muted-foreground)]">
              Using <strong className="text-foreground">{usage}</strong> of{' '}
              <strong className="text-foreground">{limit}</strong> subscriptions
            </span>
          ) : (
            <span className="text-[var(--muted-foreground)]">
              Unlimited subscriptions
              {renewLabel ? (
                <>
                  {' · '}renews <strong className="text-foreground">{renewLabel}</strong>
                </>
              ) : null}
            </span>
          )}
        </div>

        {plan === 'free' ? (
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-[var(--muted-foreground)]">
              Upgrade to Pro for <strong className="text-foreground">$8.99/mo</strong> — unlimited
              subscriptions, reminder emails, trial tracking.
            </div>
            <Button
              type="button"
              onClick={() => go('/api/stripe/checkout', 'checkout')}
              disabled={loading !== null || !stripeConfigured}
            >
              {loading === 'checkout' ? <Spinner className="size-4" /> : null}
              Upgrade to Pro
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              variant="secondary"
              onClick={() => go('/api/stripe/portal', 'portal')}
              disabled={loading !== null || !hasStripeCustomer}
            >
              {loading === 'portal' ? <Spinner className="size-4" /> : null}
              Manage billing
            </Button>
          </div>
        )}

        {!stripeConfigured ? (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            Billing isn&apos;t configured on this deployment. Add{' '}
            <code className="rounded bg-amber-500/10 px-1">STRIPE_SECRET_KEY</code>,{' '}
            <code className="rounded bg-amber-500/10 px-1">STRIPE_WEBHOOK_SECRET</code>, and{' '}
            <code className="rounded bg-amber-500/10 px-1">NEXT_PUBLIC_STRIPE_PRICE_PRO</code> to your
            environment variables to enable upgrades.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-red-600 dark:text-red-400">
            {error}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
