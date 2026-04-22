import { NextResponse } from 'next/server';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getAppUrl, getStripe, isStripeConfigured } from '@/lib/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Starts a Stripe Checkout Session for the Pro subscription and returns
 * its URL. Client can POST to this and follow the `url` field.
 *
 * Flow:
 *   1. Verify the Supabase user.
 *   2. Look up (or lazily create) a Stripe customer for that user and
 *      persist it in `user_plans`.
 *   3. Create a subscription-mode Checkout Session with success/cancel
 *      URLs that return to /app/settings.
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

  const admin = createSupabaseAdminClient();
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!;

  // 1. Find or create the Stripe customer tied to this user.
  const { data: existing } = await admin
    .from('user_plans')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  let customerId = existing?.stripe_customer_id ?? null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    // Upsert initial row so the webhook can find this user later.
    await admin.from('user_plans').upsert(
      {
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: 'free',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    );
  }

  // 2. Create the Checkout Session.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
    success_url: `${appUrl}/app/settings?checkout=success`,
    cancel_url: `${appUrl}/app/settings?checkout=cancelled`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id },
  });

  if (!session.url) {
    return NextResponse.json({ error: 'Stripe did not return a URL' }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
