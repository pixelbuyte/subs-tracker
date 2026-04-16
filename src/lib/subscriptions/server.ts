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

export async function createSubscription(input: SubscriptionInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('subscriptions').insert({
    ...input,
    user_id: user.id,
    notes: input.notes?.trim() ? input.notes.trim() : null,
  });

  if (error) throw error;
}

export async function updateSubscription(id: string, input: SubscriptionInput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      ...input,
      notes: input.notes?.trim() ? input.notes.trim() : null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteSubscription(id: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('subscriptions').delete().eq('id', id);
  if (error) throw error;
}

