import { NextResponse } from 'next/server';

import { listSubscriptions } from '@/lib/subscriptions/server';

function csvEscape(value: unknown) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET() {
  const subs = await listSubscriptions();

  const header = [
    'id',
    'name',
    'price',
    'price_cents',
    'currency',
    'billing_cycle',
    'next_renewal_date',
    'category',
    'notes',
    'status',
    'created_at',
    'updated_at',
  ];

  const rows = subs.map((s) => [
    s.id,
    s.name,
    (s.price_cents / 100).toFixed(2),
    s.price_cents,
    s.currency,
    s.billing_cycle,
    s.next_renewal_date,
    s.category,
    s.notes ?? '',
    s.status,
    s.created_at,
    s.updated_at,
  ]);

  const csv =
    `${header.join(',')}\n` + rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n';

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="subscriptions.csv"',
      'cache-control': 'no-store',
    },
  });
}

