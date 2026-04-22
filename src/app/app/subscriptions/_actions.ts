'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import {
  createSubscription,
  FreePlanLimitError,
  subscriptionInputSchema,
  updateSubscription,
  deleteSubscription,
} from '@/lib/subscriptions/server';

function parseMoneyToCents(value: FormDataEntryValue | null) {
  const str = typeof value === 'string' ? value.trim() : '';
  const normalized = str.replace(/[$,\s]/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

function getString(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

const formSchema = subscriptionInputSchema.extend({
  price_cents: z.number().int().nonnegative(),
  notes: z.string().max(500).optional(),
});

export type ActionState = { error?: string };

export async function createSubscriptionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const priceCents = parseMoneyToCents(formData.get('price'));
    if (priceCents === null) return { error: 'Price must be a number.' };

    const parsed = formSchema.parse({
      name: getString(formData, 'name'),
      price_cents: priceCents,
      billing_cycle: getString(formData, 'billing_cycle'),
      next_renewal_date: getString(formData, 'next_renewal_date'),
      category: getString(formData, 'category') || 'Other',
      notes: getString(formData, 'notes') || undefined,
      website_url: getString(formData, 'website_url') || undefined,
      status: getString(formData, 'status') || 'active',
    });

    await createSubscription(parsed);
  } catch (err) {
    if (err instanceof FreePlanLimitError) {
      return {
        error: err.message,
      };
    }
    const msg = err instanceof Error ? err.message : 'Unable to create subscription.';
    return { error: msg };
  }

  redirect('/app');
}

export async function updateSubscriptionAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const priceCents = parseMoneyToCents(formData.get('price'));
    if (priceCents === null) return { error: 'Price must be a number.' };

    const parsed = formSchema.parse({
      name: getString(formData, 'name'),
      price_cents: priceCents,
      billing_cycle: getString(formData, 'billing_cycle'),
      next_renewal_date: getString(formData, 'next_renewal_date'),
      category: getString(formData, 'category') || 'Other',
      notes: getString(formData, 'notes') || undefined,
      website_url: getString(formData, 'website_url') || undefined,
      status: getString(formData, 'status') || 'active',
    });

    await updateSubscription(id, parsed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unable to update subscription.';
    return { error: msg };
  }

  redirect('/app');
}

export async function deleteSubscriptionAction(id: string) {
  await deleteSubscription(id);
  redirect('/app');
}

