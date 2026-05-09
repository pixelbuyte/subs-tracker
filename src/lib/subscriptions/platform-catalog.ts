/**
 * Curated US list-price estimates for common subscription services.
 * Prices and tiers change by region and date — treat as hints only.
 * Last reviewed: 2026-05 (approximate USD).
 */

import type { BillingCycle } from '@/lib/subscriptions/types';

export type PlatformPlan = {
  id: string;
  label: string;
  priceCents: number;
  billingCycle: BillingCycle;
  /** Shown as secondary text on the chip */
  hint?: string;
};

export type PlatformEntry = {
  hostnames: string[];
  displayName: string;
  defaultCategory?: string;
  plans: PlatformPlan[];
};

const ENTRIES: PlatformEntry[] = [
  {
    hostnames: ['youtube.com', 'music.youtube.com', 'youtu.be'],
    displayName: 'YouTube Premium',
    defaultCategory: 'Entertainment',
    plans: [
      { id: 'yt-individual', label: 'Individual', priceCents: 1399, billingCycle: 'monthly' },
      { id: 'yt-family', label: 'Family', priceCents: 2299, billingCycle: 'monthly' },
      { id: 'yt-student', label: 'Student', priceCents: 799, billingCycle: 'monthly' },
    ],
  },
  {
    hostnames: ['cursor.com'],
    displayName: 'Cursor',
    defaultCategory: 'Productivity',
    plans: [
      {
        id: 'cursor-pro-monthly',
        label: 'Pro',
        priceCents: 2000,
        billingCycle: 'monthly',
        hint: 'Typical Pro list price',
      },
    ],
  },
  {
    hostnames: ['replit.com'],
    displayName: 'Replit',
    defaultCategory: 'Developer',
    plans: [
      {
        id: 'replit-core-monthly',
        label: 'Core (monthly)',
        priceCents: 2000,
        billingCycle: 'monthly',
        hint: 'Approximate paid tier',
      },
      {
        id: 'replit-credits',
        label: 'Usage / credits',
        priceCents: 0,
        billingCycle: 'monthly',
        hint: 'Set your usual monthly spend manually after selecting',
      },
    ],
  },
];

const HOST_TO_ENTRY = new Map<string, PlatformEntry>();

function registerHost(hostname: string, entry: PlatformEntry) {
  const key = hostname.toLowerCase().trim();
  if (key) HOST_TO_ENTRY.set(key, entry);
}

for (const entry of ENTRIES) {
  for (const h of entry.hostnames) {
    registerHost(h, entry);
  }
}

/**
 * Returns the catalog entry for a normalized hostname (e.g. from `deriveDomain`),
 * or null if unknown.
 */
export function lookupPlatformCatalog(host: string | null | undefined): PlatformEntry | null {
  if (!host) return null;
  const key = host.toLowerCase().trim();
  return HOST_TO_ENTRY.get(key) ?? null;
}
