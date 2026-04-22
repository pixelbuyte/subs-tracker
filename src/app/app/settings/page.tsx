import { redirect } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FREE_SUBSCRIPTION_LIMIT,
  getCurrentUserPlan,
  getCurrentUserSubscriptionCount,
} from '@/lib/plan/server';
import { isStripeConfigured } from '@/lib/stripe/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { PlanCard } from '@/app/app/settings/_components/plan-card';

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [plan, usage, sp] = await Promise.all([
    getCurrentUserPlan(),
    getCurrentUserSubscriptionCount(),
    searchParams,
  ]);

  const flash =
    sp.checkout === 'success' ? 'success' : sp.checkout === 'cancelled' ? 'cancelled' : null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Preferences and account basics.</p>
      </div>

      <PlanCard
        plan={plan.plan}
        usage={usage}
        limit={FREE_SUBSCRIPTION_LIMIT}
        hasStripeCustomer={Boolean(plan.stripeCustomerId)}
        currentPeriodEnd={plan.currentPeriodEnd}
        stripeConfigured={isStripeConfigured()}
        initialFlash={flash}
      />

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="text-[var(--muted-foreground)]">Signed in as</div>
          <div className="mt-1 font-medium">{user.email ?? user.id}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email reminders</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <p className="text-[var(--muted-foreground)]">
            We&apos;ll email you when an active subscription is about to renew. You&apos;ll get a
            reminder <span className="font-medium text-foreground">7 days</span>,{' '}
            <span className="font-medium text-foreground">3 days</span>, and{' '}
            <span className="font-medium text-foreground">1 day</span> before the renewal date, plus
            one on the day itself.
          </p>
          <p className="text-[var(--muted-foreground)]">
            {plan.plan === 'pro' ? (
              <>
                Multiple subs renewing at the same time get bundled into one email. Reminders go to{' '}
                <span className="font-medium text-foreground">
                  {user.email ?? 'your account email'}
                </span>
                .
              </>
            ) : (
              <>
                Reminder emails are a <span className="font-medium text-foreground">Pro</span>{' '}
                feature. Upgrade above to turn them on.
              </>
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Export all subscriptions as CSV from the dashboard using{' '}
          <span className="font-medium">Export CSV</span>.
        </CardContent>
      </Card>
    </div>
  );
}
