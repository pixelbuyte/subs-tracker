import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook receiver.
 *
 * Configure in dashboard → Developers → Webhooks:
 *   Endpoint URL:    https://<your-domain>/api/stripe/webhook
 *   Events:
 *     - checkout.session.completed
 *     - customer.subscription.created
 *     - customer.subscription.updated
 *     - customer.subscription.deleted
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET not set' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'signature verification failed';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        const userId = session.metadata?.supabase_user_id;

        if (!customerId || !userId) break;

        // Fetch the subscription to get status / period end.
        let status: string | null = null;
        let currentPeriodEnd: string | null = null;
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          status = sub.status;
          currentPeriodEnd = periodEndToIso(sub);
        }

        await admin.from('user_plans').upsert(
          {
            user_id: userId,
            plan: 'pro',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId ?? null,
            status,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;

        const plan: 'free' | 'pro' =
          event.type === 'customer.subscription.deleted' ||
          sub.status === 'canceled' ||
          sub.status === 'unpaid' ||
          sub.status === 'incomplete_expired'
            ? 'free'
            : 'pro';

        // Find the existing row by customer id so we can keep user_id.
        const { data: existing } = await admin
          .from('user_plans')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        const userId = existing?.user_id ?? sub.metadata?.supabase_user_id;
        if (!userId) break;

        await admin.from('user_plans').upsert(
          {
            user_id: userId,
            plan,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            status: sub.status,
            current_period_end: periodEndToIso(sub),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        break;
      }

      default:
        // Intentionally ignore. Return 200 so Stripe doesn't retry.
        break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'webhook handler error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function periodEndToIso(sub: Stripe.Subscription): string | null {
  // `current_period_end` is a unix timestamp (seconds). Some API versions
  // expose it on the root, others on the item. We try both defensively.
  const rootEnd = (sub as unknown as { current_period_end?: number }).current_period_end;
  const itemEnd = sub.items?.data?.[0]?.current_period_end;
  const ts = rootEnd ?? itemEnd;
  if (!ts) return null;
  return new Date(ts * 1000).toISOString();
}
