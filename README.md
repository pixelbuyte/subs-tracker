## Subscription Control Center

Desktop-first personal MVP to track subscriptions and recurring charges (manual input v1).

**Stack**
- Next.js App Router + TypeScript
- TailwindCSS
- Supabase (Auth + Postgres + RLS)

## Getting Started

### 1) Install deps

```bash
npm install
```

### 2) Create a Supabase project + set env vars

1. Create a Supabase project in the dashboard.
2. Copy `.env.example` → `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3) Create the database schema (with RLS)

Run the SQL in:

- `supabase/schema.sql`

…inside your Supabase project’s SQL editor.

### 4) Enable email/password auth

In Supabase Dashboard:
- Auth → Providers → **Email**: enable email/password

If you require email confirmation, sign-up will prompt users to check their inbox before logging in.

### 5) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## MVP Features

- Landing page
- Sign up / log in
- Dashboard totals (monthly/yearly), category totals
- Upcoming renewals (7/30 days) + highlights
- CRUD subscriptions (add/edit/delete, active/cancelled)
- Filters + search
- CSV export (Dashboard → Export CSV)
- Settings page (includes reminders/notifications stub)

