import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { BillingCycle, SubscriptionRow, SubscriptionStatus } from '@/lib/subscriptions/types';

export const subscriptionInputSchema = z.object({
  name: z.string().min(1).max(120),
  price_cents: z.number().int().nonnegative(),
  billing_cycle: z.enum(['monthly', 'yearly', 'weekly', 'quarterly']) satisfies z.ZodType<BillingCycle>,
  next_renewal_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  category: z.string().min(1).max(40),
  notes: z.string().max(500).optional(),
  website_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .transform((v) => (v ? v : undefined))
    .refine(
      (v) => {
        if (!v) return true;
        // Accept bare domains (netflix.com) OR full URLs.
        if (/^https?:\/\//i.test(v)) {
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        }
        return /^[a-z0-9][a-z0-9-]*(\.[a-z0-9-]+)+(\/.*)?$/i.test(v);
      },
      { message: 'Enter a valid URL or domain (e.g. netflix.com)' },
    ),
  status: z.enum(['active', 'cancelled']) satisfies z.ZodType<SubscriptionStatus>,
});

export type SubscriptionInput = z.infer<typeof subscriptionInputSchema>;

export async function listSubscriptions() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('next_renewal_date', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SubscriptionRow[];
}

export async function getSubscriptionById(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from('subscriptions').select('*').eq('id', id).single();
  if (error) throw error;
  return data as SubscriptionRow;
}

/**
 * Supabase/PostgREST returns these codes when the `website_url` column
 * is missing from the `subscriptions` table (i.e. the migration that
 * adds it hasn't been run yet). In that case we silently retry the
 * write without the `website_url` field so the user's save succeeds.
 */
function isMissingWebsiteColumnError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  const msg = (e.message ?? '').toLowerCase();
  // PostgREST: PGRST204 = "column/resource not found in schema cache".
  // Postgres: 42703 = "undefined_column".
  if (e.code === 'PGRST204' || e.code === '42703') {
    return msg.includes('website_url');
  }
  return msg.includes('website_url') && msg.includes('column');
}

export async function createSubscription(input: SubscriptionInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const base = {
    ...input,
    user_id: user.id,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };
  const withWebsite = {
    ...base,
    website_url: input.website_url?.trim() ? input.website_url.trim() : null,
  };

  let { error } = await supabase.from('subscriptions').insert(withWebsite);

  if (error && isMissingWebsiteColumnError(error)) {
    // Column doesn't exist yet — fall back so the user's save still lands.
    ({ error } = await supabase.from('subscriptions').insert(base));
  }

  if (error) throw error;
}

export async function updateSubscription(id: string, input: SubscriptionInput) {
  const supabase = await createSupabaseServerClient();

  const base = {
    ...input,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  };
  const withWebsite = {
    ...base,
    website_url: input.website_url?.trim() ? input.website_url.trim() : null,
  };

  let { error } = await supabase.from('subscriptions').update(withWebsite).eq('id', id);

  if (error && isMissingWebsiteColumnError(error)) {
    ({ error } = await supabase.from('subscriptions').update(base).eq('id', id));
  }

  if (error) throw error;
}

export async function deleteSubscription(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
}

/**
 * Returns true if the `website_url` column exists on the subscriptions
 * table. Used to show a one-line migration hint when editing, so users
 * aren't confused about why URLs don't persist.
 */
export async function hasWebsiteUrlColumn(): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('subscriptions').select('website_url').limit(1);
  if (!error) return true;
  return !isMissingWebsiteColumnError(error);
}

