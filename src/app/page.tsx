import Link from 'next/link';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-wide">Subscription Control Center</div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="secondary" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </header>

        <section className="grid items-start gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h1 className="text-4xl font-semibold tracking-tight">
              Your subscriptions, under control.
            </h1>
            <p className="max-w-prose text-[15px] leading-7 text-[var(--muted-foreground)]">
              Track every subscription and recurring charge in one clean dashboard. No bank
              connections in v1—just fast manual entry, clear totals, and renewal reminders.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">Get started</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  I already have an account
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
              <span className="rounded-md bg-muted px-2 py-1">Desktop-first</span>
              <span className="rounded-md bg-muted px-2 py-1">Fast totals</span>
              <span className="rounded-md bg-muted px-2 py-1">Upcoming renewals</span>
              <span className="rounded-md bg-muted px-2 py-1">CSV export</span>
              <span className="rounded-md bg-muted px-2 py-1">Light/Dark</span>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>What you’ll see</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2 rounded-md border border-[var(--border)] bg-muted p-4">
                <div className="text-xs text-[var(--muted-foreground)]">At a glance</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md bg-card p-3">
                    <div className="text-xs text-[var(--muted-foreground)]">Monthly total</div>
                    <div className="text-lg font-semibold">$—</div>
                  </div>
                  <div className="rounded-md bg-card p-3">
                    <div className="text-xs text-[var(--muted-foreground)]">Yearly total</div>
                    <div className="text-lg font-semibold">$—</div>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-card p-4 text-sm">
                Clean table + card views, filters, and renewal highlights.
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
