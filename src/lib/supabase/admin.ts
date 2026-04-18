import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service-role key.
 * BYPASSES Row Level Security. NEVER import this from client components or
 * expose the result to the browser. Use only in:
 *   - API routes / route handlers
 *   - Server-only background jobs (cron)
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_URL). ' +
        'Required for server-only admin operations like the reminder cron.',
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
