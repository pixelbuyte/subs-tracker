import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type Plan = 'free' | 'pro';

/** Hard limit on active+cancelled subscriptions for Free users. */
export const FREE_SUBSCRIPTION_LIMIT = 5;

export type UserPlan = {
  plan: Plan;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

const FREE_PLAN: UserPlan = {
  plan: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  status: null,
  currentPeriodEnd: null,
};

/**
 * Same code path used in a RLS-scoped request. Returns 'free' if the user
 * has no plan row yet (lazy default).
 */
export async function getCurrentUserPlan(): Promise<UserPlan> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return FREE_PLAN;

  const { data, error } = await supabase
    .from('user_plans')
    .select('plan, stripe_customer_id, stripe_subscription_id, status, current_period_end')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return FREE_PLAN;

  return {
    plan: (data.plan as Plan) ?? 'free',
    stripeCustomerId: data.stripe_customer_id ?? null,
    stripeSubscriptionId: data.stripe_subscription_id ?? null,
    status: data.status ?? null,
    currentPeriodEnd: data.current_period_end ?? null,
  };
}

/** Server-side count of the current user's subscriptions. Free tier cap check. */
export async function getCurrentUserSubscriptionCount(): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

/**
 * Admin-client variant, used by Stripe webhooks (no session context).
 * Bypasses RLS — never call from user-facing code.
 */
export async function getUserPlanByCustomerId(customerId: string): Promise<UserPlan | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('user_plans')
    .select('user_id, plan, stripe_customer_id, stripe_subscription_id, status, current_period_end')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();
  if (!data) return null;
  return {
    plan: (data.plan as Plan) ?? 'free',
    stripeCustomerId: data.stripe_customer_id,
    stripeSubscriptionId: data.stripe_subscription_id,
    status: data.status,
    currentPeriodEnd: data.current_period_end,
  };
}
