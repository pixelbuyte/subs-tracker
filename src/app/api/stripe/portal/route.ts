import { NextResponse } from 'next/server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAppUrl, getStripe, isStripeConfigured } from '@/lib/stripe/server';
import { getCurrentUserPlan } from '@/lib/plan/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Creates a Stripe Customer Portal session so the user can manage their
 * Pro subscription (change card, cancel, view invoices, etc.).
 */
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Stripe is not configured on this deployment.' },
      { status: 500 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const plan = await getCurrentUserPlan();
  if (!plan.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer on file for this user.' },
      { status: 400 },
    );
  }

  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: plan.stripeCustomerId,
    return_url: `${getAppUrl()}/app/settings`,
  });

  return NextResponse.json({ url: session.url });
}
