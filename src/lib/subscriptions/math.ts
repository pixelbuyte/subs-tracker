import type { BillingCycle } from '@/lib/subscriptions/types';

export function monthlyEquivalentCents(priceCents: number, cycle: BillingCycle) {
  switch (cycle) {
    case 'monthly':
      return priceCents;
    case 'yearly':
      return Math.round(priceCents / 12);
    case 'quarterly':
      return Math.round(priceCents / 3);
    case 'weekly':
      return Math.round((priceCents * 52) / 12);
    default:
      return priceCents;
  }
}

export function yearlyEquivalentCents(priceCents: number, cycle: BillingCycle) {
  return monthlyEquivalentCents(priceCents, cycle) * 12;
}

