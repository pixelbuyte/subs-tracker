import Stripe from 'stripe';

/** Server-only Stripe client. Throws if STRIPE_SECRET_KEY is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not configured. Add it to .env.local / Vercel env vars.',
    );
  }
  return new Stripe(key, {
    // Pin to a known, stable API version. Update intentionally.
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
    appInfo: {
      name: 'Subscription Control Center',
      version: '0.1.0',
    },
  });
}

/** True only if all Stripe env vars are present and non-empty. */
export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO &&
      process.env.NEXT_PUBLIC_APP_URL,
  );
}

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return 'http://localhost:3000';
}
