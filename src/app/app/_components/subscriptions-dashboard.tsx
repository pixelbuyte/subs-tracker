'use client';

import * as React from 'react';
import Link from 'next/link';
import { LayoutGrid, List, Search } from 'lucide-react';

import type { SubscriptionRow, SubscriptionStatus } from '@/lib/subscriptions/types';
import { monthlyEquivalentCents, yearlyEquivalentCents } from '@/lib/subscriptions/math';
import { formatUsdFromCents } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

function parseDateYmd(ymd: string) {
  // Interpret as local date (not UTC) to avoid off-by-one in many time zones.
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function daysUntil(date: Date) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function renewalCountdownLabel(diffDays: number) {
  if (diffDays === 0) return 'Renews today';
  if (diffDays === 1) return 'Renews tomorrow';
  if (diffDays > 1) return `Renews in ${diffDays} days`;
  if (diffDays === -1) return 'Overdue by 1 day';
  return `Overdue by ${Math.abs(diffDays)} days`;
}

function renewalShortLabel(diffDays: number) {
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `${diffDays} days left`;
  if (diffDays === -1) return '1 day overdue';
  return `${Math.abs(diffDays)} days overdue`;
}

function statusBadgeVariant(status: SubscriptionStatus) {
  return status === 'active' ? 'success' : 'default';
}

function SubscriptionCard({ sub: s }: { sub: SubscriptionRow }) {
  const d = parseDateYmd(s.next_renewal_date);
  const diff = daysUntil(d);
  const isSoon = s.status === 'active' && diff >= 0 && diff <= 7;
  const isOverdue = s.status === 'active' && diff < 0;
  const showCountdown = s.status === 'active' && (diff <= 30 || isOverdue || isSoon);

  return (
    <Card className={cn(isSoon && 'border-amber-500/40')}>
      <CardContent className="grid gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate font-medium">{s.name}</div>
            <div className="truncate text-xs text-[var(--muted-foreground)]">
              {formatUsdFromCents(s.price_cents)} · {s.billing_cycle}
            </div>
          </div>
          <Badge variant={statusBadgeVariant(s.status)}>{s.status}</Badge>
        </div>
        <div className="text-sm">
          <span className="text-[var(--muted-foreground)]">Next:</span>{' '}
          <span className={cn(isSoon && 'text-amber-600 dark:text-amber-400')}>
            {s.next_renewal_date}
          </span>
        </div>
        {showCountdown ? (
          <div
            className={cn(
              'text-xs',
              isOverdue
                ? 'text-red-600 dark:text-red-400'
                : isSoon
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-[var(--muted-foreground)]',
            )}
          >
            {renewalCountdownLabel(diff)}
          </div>
        ) : null}
        <div className="text-xs text-[var(--muted-foreground)]">{s.category}</div>
        <div className="pt-1">
          <Link href={`/app/subscriptions/${s.id}/edit`}>
            <Button size="sm" variant="secondary" className="w-full sm:w-auto">
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function SubscriptionsDashboard({ subscriptions }: { subscriptions: SubscriptionRow[] }) {
  const [view, setView] = React.useState<'table' | 'cards'>('table');
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState<'all' | SubscriptionStatus>('all');
  const [category, setCategory] = React.useState<'all' | string>('all');

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    subscriptions.forEach((s) => set.add(s.category));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subscriptions]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscriptions.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (category !== 'all' && s.category !== category) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q);
    });
  }, [subscriptions, query, status, category]);

  const active = React.useMemo(() => subscriptions.filter((s) => s.status === 'active'), [subscriptions]);

  const totals = React.useMemo(() => {
    let monthly = 0;
    let yearly = 0;
    for (const s of active) {
      monthly += monthlyEquivalentCents(s.price_cents, s.billing_cycle);
      yearly += yearlyEquivalentCents(s.price_cents, s.billing_cycle);
    }
    return { monthly, yearly };
  }, [active]);

  const upcoming = React.useMemo(() => {
    const seven: SubscriptionRow[] = [];
    const thirty: SubscriptionRow[] = [];
    for (const s of active) {
      const d = parseDateYmd(s.next_renewal_date);
      const diff = daysUntil(d);
      if (diff < 0) continue;
      if (diff <= 7) seven.push(s);
      if (diff <= 30) thirty.push(s);
    }
    return { seven, thirty };
  }, [active]);

  const categoryTotals = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const s of active) {
      const current = map.get(s.category) ?? 0;
      map.set(s.category, current + monthlyEquivalentCents(s.price_cents, s.billing_cycle));
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [active]);

  return (
    <div className="grid gap-4 sm:gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold sm:text-3xl">
            {formatUsdFromCents(totals.monthly)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Yearly total</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold sm:text-3xl">
            {formatUsdFromCents(totals.yearly)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Renewals</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Next 7 days</span>
              <span className="font-medium">{upcoming.seven.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--muted-foreground)]">Next 30 days</span>
              <span className="font-medium">{upcoming.thirty.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming (7 days)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {upcoming.seven.length === 0 ? (
              <div className="text-[var(--muted-foreground)]">No renewals in the next week.</div>
            ) : (
              upcoming.seven.slice(0, 6).map((s) => {
                const diff = daysUntil(parseDateYmd(s.next_renewal_date));
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="truncate text-xs text-[var(--muted-foreground)]">
                        {s.next_renewal_date} · {formatUsdFromCents(s.price_cents)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning" className="max-w-[160px] truncate">
                        {renewalShortLabel(diff)}
                      </Badge>
                      <Link href={`/app/subscriptions/${s.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {upcoming.thirty.length === 0 ? (
              <div className="text-[var(--muted-foreground)]">No renewals in the next 30 days.</div>
            ) : (
              upcoming.thirty.slice(0, 6).map((s) => {
                const diff = daysUntil(parseDateYmd(s.next_renewal_date));
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{s.name}</div>
                      <div className="truncate text-xs text-[var(--muted-foreground)]">
                        {s.next_renewal_date} · {formatUsdFromCents(s.price_cents)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={diff <= 7 ? 'warning' : 'default'} className="max-w-[160px] truncate">
                        {renewalShortLabel(diff)}
                      </Badge>
                      <Link href={`/app/subscriptions/${s.id}/edit`}>
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <CardTitle>Subscriptions</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                    placeholder="Search by name…"
                  />
                </div>
                <Select
                  className="flex-1 sm:flex-none"
                  value={status}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'all' || v === 'active' || v === 'cancelled') setStatus(v);
                  }}
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
                <Select
                  className="flex-1 sm:flex-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

                <div className="ml-auto hidden items-center rounded-md border border-[var(--border)] bg-card p-1 sm:flex">
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm',
                      view === 'table' ? 'bg-muted' : 'hover:bg-muted',
                    )}
                    onClick={() => setView('table')}
                    aria-label="Table view"
                  >
                    <List className="size-4" />
                    <span className="hidden sm:inline">Table</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm',
                      view === 'cards' ? 'bg-muted' : 'hover:bg-muted',
                    )}
                    onClick={() => setView('cards')}
                    aria-label="Card view"
                  >
                    <LayoutGrid className="size-4" />
                    <span className="hidden sm:inline">Cards</span>
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="rounded-md border border-[var(--border)] bg-muted p-6 text-sm text-[var(--muted-foreground)]">
                No subscriptions match your filters.
              </div>
            ) : (
              <>
                {/* Desktop: table OR cards per toggle. Hidden below sm. */}
                <div className="hidden sm:block">
                  {view === 'table' ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-[var(--muted-foreground)]">
                          <tr className="border-b border-[var(--border)]">
                            <th className="py-2 pr-4">Name</th>
                            <th className="py-2 pr-4">Price</th>
                            <th className="py-2 pr-4">Cycle</th>
                            <th className="py-2 pr-4">Next renewal</th>
                            <th className="py-2 pr-4">Category</th>
                            <th className="py-2 pr-4">Status</th>
                            <th className="py-2 pr-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((s) => {
                            const d = parseDateYmd(s.next_renewal_date);
                            const diff = daysUntil(d);
                            const isSoon = s.status === 'active' && diff >= 0 && diff <= 7;
                            const isOverdue = s.status === 'active' && diff < 0;
                            const showCountdown =
                              s.status === 'active' && (diff <= 30 || isOverdue || isSoon);

                            return (
                              <tr
                                key={s.id}
                                className="border-b border-[var(--border)] last:border-0"
                              >
                                <td className="py-3 pr-4 font-medium">
                                  <div
                                    className={cn(isSoon && 'text-amber-600 dark:text-amber-400')}
                                  >
                                    {s.name}
                                  </div>
                                </td>
                                <td className="py-3 pr-4">{formatUsdFromCents(s.price_cents)}</td>
                                <td className="py-3 pr-4 capitalize">{s.billing_cycle}</td>
                                <td className="py-3 pr-4">
                                  <div>{s.next_renewal_date}</div>
                                  {showCountdown ? (
                                    <div
                                      className={cn(
                                        'mt-0.5 text-xs',
                                        isOverdue
                                          ? 'text-red-600 dark:text-red-400'
                                          : isSoon
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-[var(--muted-foreground)]',
                                      )}
                                    >
                                      {renewalCountdownLabel(diff)}
                                    </div>
                                  ) : null}
                                </td>
                                <td className="py-3 pr-4">{s.category}</td>
                                <td className="py-3 pr-4">
                                  <Badge variant={statusBadgeVariant(s.status)}>{s.status}</Badge>
                                </td>
                                <td className="py-3 pr-4 text-right">
                                  <Link href={`/app/subscriptions/${s.id}/edit`}>
                                    <Button variant="secondary" size="sm">
                                      Edit
                                    </Button>
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {filtered.map((s) => (
                        <SubscriptionCard key={s.id} sub={s} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile: always cards, one per row, tap-friendly. */}
                <div className="grid gap-3 sm:hidden">
                  {filtered.map((s) => (
                    <SubscriptionCard key={s.id} sub={s} />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {categoryTotals.length === 0 ? (
              <div className="text-[var(--muted-foreground)]">Add subscriptions to see breakdowns.</div>
            ) : (
              categoryTotals.map(([cat, cents]) => (
                <div key={cat} className="flex items-center justify-between gap-3">
                  <div className="truncate text-[var(--muted-foreground)]">{cat}</div>
                  <div className="font-medium">{formatUsdFromCents(cents)}</div>
                </div>
              ))
            )}

            <div className="pt-3">
              <Link href="/app/subscriptions/new">
                <Button className="w-full">Add subscription</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

