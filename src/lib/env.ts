import { z } from 'zod';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  // Supabase is migrating from legacy `anon` keys to `publishable` keys.
  // Support either so the app works in both setups.
  NEXT_PUBLIC_SUPABASE_KEY: z.string().min(1),
});

let cached: z.infer<typeof envSchema> | null = null;

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );
}

export function getEnv() {
  if (cached) return cached;

  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };

  const isBuild = process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
  if (isBuild && (!raw.NEXT_PUBLIC_SUPABASE_URL || !raw.NEXT_PUBLIC_SUPABASE_KEY)) {
    cached = {
      NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
      NEXT_PUBLIC_SUPABASE_KEY: 'build-placeholder',
    };
    return cached;
  }

  if (!raw.NEXT_PUBLIC_SUPABASE_URL || !raw.NEXT_PUBLIC_SUPABASE_KEY) {
    throw new Error(
      'Missing Supabase env vars. Create `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or legacy NEXT_PUBLIC_SUPABASE_ANON_KEY).',
    );
  }

  cached = envSchema.parse(raw);
  return cached;
}

export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop) {
    return getEnv()[prop as keyof ReturnType<typeof getEnv>];
  },
});

