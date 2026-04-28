import { NextResponse } from 'next/server';

import { isStripeConfigured } from '@/lib/stripe/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safePeek(name: keyof NodeJS.ProcessEnv) {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    return { present: false as const };
  }
  const trimmed = v.trim();
  const prefix = trimmed.slice(0, 12);
  return {
    present: true as const,
    len: trimmed.length,
    prefix,
  };
}

/**
 * SANITIZED Stripe env diagnostics — never echoes full secrets.
 *
 * SECURITY: Intended for short-lived debugging sessions. Remove once resolved.
 *
 * Hypotheses mapped:
 *  H1: Production deployment missing STRIPE_* / NEXT_PUBLIC_STRIPE_PRICE_PRO entirely
 *  H2: Wrong value types (must be sk_/whsec_/price_ prefixes per var)
 *  H3: Env vars scoped to Preview only (VERCEL_ENV indicates preview vs prod)
 *  H4: APP_URL missing (doesn't toggle banner, but confirms partial config)
 */
export async function GET() {
  const sk = safePeek('STRIPE_SECRET_KEY');
  const wh = safePeek('STRIPE_WEBHOOK_SECRET');
  const price = safePeek('NEXT_PUBLIC_STRIPE_PRICE_PRO');
  const appUrl = safePeek('NEXT_PUBLIC_APP_URL');

  const booleansConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
  );

  const payload = {
    vercelEnv: process.env.VERCEL_ENV ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
    region: process.env.VERCEL_REGION ?? null,
    sk,
    wh,
    price,
    appUrl,
    booleansConfigured,
    libIsStripeConfigured: isStripeConfigured(),
    expectedPrefixes: {
      STRIPE_SECRET_KEY: ['sk_live_', 'sk_test_'],
      STRIPE_WEBHOOK_SECRET: ['whsec_'],
      NEXT_PUBLIC_STRIPE_PRICE_PRO: ['price_'],
    },
    ts: Date.now(),
  };

  // #region agent log
  fetch('http://127.0.0.1:7930/ingest/1d156db8-503a-4596-a731-9bec63d02d00', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Debug-Session-Id': 'a786e5',
    },
    body: JSON.stringify({
      sessionId: 'a786e5',
      runId: 'pre-fix',
      hypothesisId: 'H1-H4',
      location: 'src/app/api/debug/stripe-env/route.ts:GET',
      message: 'Stripe env sanitized snapshot',
      data: payload,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  return NextResponse.json(payload);
}
