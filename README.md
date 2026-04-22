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

### 4) Enable auth providers

In Supabase Dashboard:
- Auth → Providers → **Email**: enable email/password

If you require email confirmation, sign-up will prompt users to check their inbox before logging in.

**Google sign-in (optional)**  
- Auth → Providers → **Google**: enable, add Client ID + Secret from Google Cloud Console.  
- Google Cloud → OAuth client → **Authorized redirect URIs**:  
  `https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`  
- Supabase → Auth → **URL Configuration** → **Redirect URLs**: add  
  `http://localhost:3000/auth/callback`  
  and your production URL (e.g. `https://yourdomain.com/auth/callback`).  
The app uses `/auth/callback` to finish the OAuth flow and send users to `/app`.

### 5) (Optional) Email reminders

Daily cron sends users an email when an active subscription renews in 7 / 3 / 1 / 0 days.

1. Create a [Resend](https://resend.com) account, verify a sending domain (or use `onboarding@resend.dev` for local testing), and grab an API key.
2. In Supabase → **Project Settings → API**, copy the `service_role` key (server-only — never expose).
3. Add to `.env.local` (and to Vercel project env vars for prod):
   ```
   SUPABASE_SERVICE_ROLE_KEY=...
   RESEND_API_KEY=...
   EMAIL_FROM="Subscription Control Center <reminders@yourdomain.com>"
   CRON_SECRET=any-long-random-string
   ```
4. The cron schedule lives in `vercel.json` (`0 14 * * *` UTC = 9am ET).
5. Deploy. Vercel will run the cron automatically and send `Authorization: Bearer $CRON_SECRET`.

**Test it manually:**
```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/reminders
```

Returns `{ ok, processed, sent, skipped, failures, gatedByPlan }`. The dedupe table (`sent_reminders`) prevents double-sends. **Reminder emails are a Pro feature** — users without a `pro` row in `user_plans` are gated out (counted in `gatedByPlan`).

### 6) (Optional) Stripe billing (Pro plan — $8.99/mo)

Unlocks unlimited subscriptions + reminder emails. Leave these env vars blank to run the app without billing; the upgrade button will just show a configuration notice.

1. Create a [Stripe](https://stripe.com) account (test mode is fine).
2. **Dashboard → Product catalog → Add product**
   - Name: `Subscription Control Center — Pro`
   - Pricing: **Recurring**, `$8.99`, billed **monthly**
   - Save and copy the **Price ID** (starts with `price_…`).
3. **Dashboard → Developers → API keys** — copy the **Secret key** (`sk_test_…`).
4. Add to `.env.local` (and Vercel project env vars for prod):
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
   NEXT_PUBLIC_APP_URL=http://localhost:3000   # prod: https://yourdomain.com
   ```
5. **Dashboard → Developers → Webhooks → Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook` (for local dev, use the Stripe CLI — see below)
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - After saving, click **Reveal** under "Signing secret" and copy `whsec_…` → set as:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
6. **Dashboard → Settings → Billing → Customer Portal** — enable the portal and allow subscription cancellation / payment method updates.

**Local webhook testing with Stripe CLI:**
```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
# copy the whsec_... it prints into .env.local
```

**Users:** Free gets 5 subscriptions. Pro gets unlimited + reminder emails. Upgrade flow lives on `/app/settings`.

### 7) Run locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## MVP Features

- Landing page
- Sign up / log in (email + Google OAuth)
- Dashboard totals (monthly/yearly), category totals
- Upcoming renewals (7/30 days) + day-by-day countdown
- CRUD subscriptions (add/edit/delete, active/cancelled)
- Filters + search, table + card views, mobile-first cards on phones
- CSV export (Dashboard → Export CSV)
- **Daily email reminders** (7 / 3 / 1 / 0 days before renewal, bundled per user — Pro only)
- **Stripe billing** — Free (5 subs) / Pro (unlimited, $8.99/mo)
- Settings page

