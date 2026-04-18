import { describe, expect, it } from 'vitest';

import { monthlyEquivalentCents, yearlyEquivalentCents } from '@/lib/subscriptions/math';

describe('monthlyEquivalentCents', () => {
  it('keeps monthly values unchanged', () => {
    expect(monthlyEquivalentCents(1299, 'monthly')).toBe(1299);
  });

  it('converts yearly values into monthly amounts', () => {
    expect(monthlyEquivalentCents(12000, 'yearly')).toBe(1000);
  });

  it('converts quarterly values into monthly amounts', () => {
    expect(monthlyEquivalentCents(3000, 'quarterly')).toBe(1000);
  });

  it('converts weekly values into monthly amounts', () => {
    expect(monthlyEquivalentCents(1000, 'weekly')).toBe(4333);
  });
});

describe('yearlyEquivalentCents', () => {
  it('returns yearly amount from monthly equivalent', () => {
    expect(yearlyEquivalentCents(12000, 'yearly')).toBe(12000);
    expect(yearlyEquivalentCents(1000, 'weekly')).toBe(51996);
  });
});
