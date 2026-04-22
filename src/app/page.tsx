import Link from 'next/link';
import {
  ArrowRight,
  BellRing,
  Calendar,
  ChartPie,
  CheckCircle2,
  Download,
  Filter,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Wallet,
  Zap,
} from 'lucide-react';

import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Top nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-wide">
            <LogoMark />
            <span className="hidden sm:inline">Subscription Control Center</span>
            <span className="sm:hidden">Subs Control</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              Features
            </a>
            <a href="#how" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              How it works
            </a>
            <a href="#pricing" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              Pricing
            </a>
            <a href="#faq" className="rounded-md px-3 py-2 text-sm hover:bg-muted">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-[-10%] h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 via-fuchsia-500/10 to-cyan-500/20 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-card px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
                <Sparkles className="size-3.5 text-amber-500" />
                Stop forgetting $15.99 here, $9.99 there
              </span>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                Your subscriptions,
                <br />
                <span className="bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  finally under control.
                </span>
              </h1>

              <p className="max-w-xl text-base leading-7 text-[var(--muted-foreground)] sm:text-[17px]">
                One clean dashboard for every recurring charge. See monthly &amp; yearly spend,
                get renewal emails before you&apos;re billed, and cancel what you don&apos;t
                need — without connecting a bank account.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start free <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    I already have an account
                  </Button>
                </Link>
              </div>

              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted-foreground)]">
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Free forever plan
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> No bank connection
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> Works on mobile
                </li>
              </ul>
            </div>

            {/* Dashboard preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────── */}
      <section className="border-y border-[var(--border)] bg-muted/40">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          <Stat label="Average person has" value="12+" sub="active subscriptions" />
          <Stat label="Yearly overspend" value="$273" sub="on forgotten subs (Chase, 2024)" />
          <Stat label="Free tier" value="5" sub="subscriptions tracked" />
          <Stat label="Takes" value="2 min" sub="to set up" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need.
            <br />
            Nothing you don&apos;t.
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Built to answer one question: <em>&ldquo;Where is my money going every month?&rdquo;</em>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feature
            icon={<Wallet className="size-5" />}
            title="Monthly &amp; yearly totals"
            body="See exactly what you're spending. Weekly, monthly, quarterly, yearly — all normalized."
            accent="from-indigo-500/20 to-indigo-500/0"
          />
          <Feature
            icon={<BellRing className="size-5" />}
            title="Renewal reminders"
            body="Email you 7, 3, 1, and 0 days before a renewal. Cancel before you're charged."
            accent="from-amber-500/20 to-amber-500/0"
          />
          <Feature
            icon={<ChartPie className="size-5" />}
            title="Category breakdown"
            body="Entertainment, software, fitness, food — instantly see where the spend actually goes."
            accent="from-emerald-500/20 to-emerald-500/0"
          />
          <Feature
            icon={<Search className="size-5" />}
            title="Search &amp; filter"
            body="Filter by status, category, or search by name. Find anything in seconds."
            accent="from-cyan-500/20 to-cyan-500/0"
          />
          <Feature
            icon={<Download className="size-5" />}
            title="CSV export"
            body="Own your data. Export everything anytime, no lock-in, no weird format."
            accent="from-fuchsia-500/20 to-fuchsia-500/0"
          />
          <Feature
            icon={<Moon className="size-5" />}
            title="Dark mode + mobile"
            body="Looks great on a laptop at night and on your phone in the morning. Installable as a PWA."
            accent="from-slate-500/20 to-slate-500/0"
          />
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section id="how" className="border-y border-[var(--border)] bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Set it up in two minutes.
            </h2>
            <p className="mt-3 text-[var(--muted-foreground)]">
              No bank login. No Plaid. No spreadsheets. Just type &amp; go.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Step
              num="01"
              icon={<Zap className="size-5" />}
              title="Sign up free"
              body="Email or Google — takes 10 seconds. No credit card. No bank connection."
            />
            <Step
              num="02"
              icon={<Calendar className="size-5" />}
              title="Add your subs"
              body="Name, price, cycle, renewal date. 30 seconds each. You'll remember the top 5 off the top of your head."
            />
            <Step
              num="03"
              icon={<TrendingDown className="size-5" />}
              title="Save money"
              body="Dashboard shows your real monthly burn. Get reminder emails before charges. Cancel the junk."
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple pricing.</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Start free. Upgrade when it pays for itself.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PricingCard
            name="Free"
            price="$0"
            tagline="Perfect to start"
            features={[
              'Up to 5 subscriptions',
              'Monthly & yearly totals',
              'Category breakdown',
              'CSV export',
              'Light & dark mode',
            ]}
            cta={
              <Link href="/signup" className="w-full">
                <Button className="w-full" variant="secondary">
                  Get started free
                </Button>
              </Link>
            }
          />
          <PricingCard
            name="Pro"
            price="$4"
            period="/ month"
            tagline="The upgrade that saves its own price"
            highlighted
            features={[
              'Unlimited subscriptions',
              'Email reminders (7/3/1/0 days)',
              'Trial end-date tracking',
              'Price history & insights',
              'Priority support',
            ]}
            cta={
              <Link href="/signup" className="w-full">
                <Button className="w-full">Start free, upgrade anytime</Button>
              </Link>
            }
          />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted-foreground)]">
          Cancel anytime. One forgotten subscription typically costs more than a year of Pro.
        </p>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-[var(--border)] bg-muted/40">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
          <h2 className="mb-10 text-3xl font-semibold tracking-tight sm:text-4xl">
            Frequently asked
          </h2>
          <div className="grid gap-3">
            <FAQ
              q="Do I have to connect my bank account?"
              a="Nope. This is deliberate. You enter subscriptions manually — it's faster and safer than wrestling with bank APIs, and you stay in full control of your data."
            />
            <FAQ
              q="Is my data private?"
              a="Yes. Stored in Supabase (Postgres) with per-user row-level security. Only you can read your own subscriptions. You can export or delete anytime."
            />
            <FAQ
              q="Will I actually remember to add things?"
              a="You'll remember 80% off the top of your head in 2 minutes. For the rest, scan your last credit card statement once — you'll find every recurring charge in minutes."
            />
            <FAQ
              q="Why is there a paid tier?"
              a="To cover servers + email costs honestly. $4/mo is designed to pay for itself the first time a reminder saves you from a forgotten charge."
            />
            <FAQ
              q="Can I cancel / export my data?"
              a="Always. One-click CSV export. Delete your account and all data is wiped."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-card p-8 sm:p-12">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10"
          />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Take back control of your recurring spend.
              </h2>
              <p className="mt-2 text-[var(--muted-foreground)]">
                Free forever for up to 5 subscriptions. Sign up in 10 seconds.
              </p>
            </div>
            <Link href="/signup">
              <Button size="lg">
                Start free <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-[var(--muted-foreground)] sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span>© {new Date().getFullYear()} Subscription Control Center</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <a
              href="https://github.com/pixelbuyte/subs-tracker"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Small components ───────────────────────────────────────── */

function LogoMark() {
  return (
    <span
      aria-hidden
      className="flex size-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-cyan-500 text-[10px] font-bold text-white"
    >
      S
    </span>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      <div className="text-xs text-[var(--muted-foreground)]">{sub}</div>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-card p-5 transition hover:shadow-sm">
      <div
        aria-hidden
        className={`pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br ${accent} opacity-70 blur-2xl`}
      />
      <div className="relative flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-background text-foreground">
          {icon}
        </div>
        <h3 className="text-[15px] font-semibold">{title}</h3>
      </div>
      <p className="relative mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}

function Step({
  num,
  icon,
  title,
  body,
}: {
  num: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-background">
          {icon}
        </div>
        <span className="text-xs font-mono text-[var(--muted-foreground)]">{num}</span>
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{body}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  tagline,
  features,
  cta,
  highlighted,
}: {
  name: string;
  price: string;
  period?: string;
  tagline: string;
  features: string[];
  cta: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        highlighted
          ? 'border-transparent bg-gradient-to-b from-indigo-500/10 to-fuchsia-500/5 ring-1 ring-indigo-500/40'
          : 'border-[var(--border)] bg-card'
      }`}
    >
      {highlighted && (
        <span className="absolute right-5 top-5 rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
          Pro
        </span>
      )}
      <div className="text-sm font-medium text-[var(--muted-foreground)]">{name}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        {period ? <span className="text-sm text-[var(--muted-foreground)]">{period}</span> : null}
      </div>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{tagline}</p>
      <ul className="mt-5 grid gap-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">{cta}</div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-lg border border-[var(--border)] bg-card p-4 open:shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
        <span>{q}</span>
        <span className="text-[var(--muted-foreground)] transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{a}</p>
    </details>
  );
}

/* ── Dashboard preview (static mock) ────────────────────────── */

function DashboardPreview() {
  const rows = [
    { name: 'Netflix', price: '$15.99', cycle: 'monthly', when: 'Renews in 3 days', accent: 'amber' },
    { name: 'Spotify', price: '$9.99', cycle: 'monthly', when: 'Renews in 12 days', accent: 'muted' },
    { name: 'iCloud+', price: '$2.99', cycle: 'monthly', when: 'Renews in 18 days', accent: 'muted' },
    { name: 'NYT', price: '$17.00', cycle: 'monthly', when: 'Renews tomorrow', accent: 'red' },
  ] as const;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-transparent to-fuchsia-500/10 blur-2xl"
      />
      <div className="rotate-[0.3deg] rounded-2xl border border-[var(--border)] bg-card p-4 shadow-xl">
        {/* fake window chrome */}
        <div className="flex items-center gap-1.5 px-1 pb-3">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-3 text-xs text-[var(--muted-foreground)]">
            subscription-control-center
          </span>
        </div>

        {/* totals row */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/60 p-3">
          <MockStat label="Monthly" value="$84.21" />
          <MockStat label="Yearly" value="$1,010.52" />
          <MockStat label="Upcoming (7d)" value="2" accent />
        </div>

        {/* table */}
        <div className="mt-3 rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center gap-2">
              <Filter className="size-3.5" /> All · Active
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-3.5 text-emerald-500" /> RLS protected
            </div>
          </div>
          <ul className="divide-y divide-[var(--border)]">
            {rows.map((r) => (
              <li key={r.name} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-8 items-center justify-center rounded-md text-xs font-semibold ${
                      r.accent === 'amber'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                        : r.accent === 'red'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : 'bg-muted text-[var(--muted-foreground)]'
                    }`}
                  >
                    {r.name[0]}
                  </span>
                  <div>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {r.price} · {r.cycle}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    r.accent === 'amber'
                      ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : r.accent === 'red'
                        ? 'bg-red-500/15 text-red-700 dark:text-red-400'
                        : 'bg-muted text-[var(--muted-foreground)]'
                  }`}
                >
                  {r.when}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MockStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-md bg-card p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </div>
      <div
        className={`mt-0.5 text-base font-semibold ${
          accent ? 'text-amber-600 dark:text-amber-400' : ''
        }`}
      >
        {value}
      </div>
    </div>
  );
}
