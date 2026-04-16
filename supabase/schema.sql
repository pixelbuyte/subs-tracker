-- Subscription Control Center (MVP) schema
-- Run this in the Supabase SQL editor for your project.

create extension if not exists "pgcrypto";

-- Keep timestamps up to date
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',

  billing_cycle text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'quarterly')),
  next_renewal_date date not null,

  category text not null default 'Other',
  notes text,

  status text not null default 'active' check (status in ('active', 'cancelled')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_user_renewal_idx on public.subscriptions (user_id, next_renewal_date);
create index if not exists subscriptions_user_status_idx on public.subscriptions (user_id, status);
create index if not exists subscriptions_user_category_idx on public.subscriptions (user_id, category);

drop trigger if exists set_subscriptions_updated_at on public.subscriptions;
create trigger set_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

alter table public.subscriptions enable row level security;

-- Policies: per-user CRUD
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own"
on public.subscriptions
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own"
on public.subscriptions
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own"
on public.subscriptions
for delete
to authenticated
using (user_id = auth.uid());

