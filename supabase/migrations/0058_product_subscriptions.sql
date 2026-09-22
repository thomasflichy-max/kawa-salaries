-- Run this once in the Supabase SQL Editor, after 0001-0057.
--
-- "Réassort automatique" — a salarié subscribes a product to a recurring
-- cadence. Deliberately NOT a real auto-charge subscription: the checkout
-- stays the redirect-only CAWL hosted page (PCI DSS SAQ A, no stored card),
-- so this only pre-fills the cart and emails a reminder every N weeks — the
-- salarié still has to open the cart and pay like any other order. See
-- app/api/cron/subscription-reminders/route.ts.

create table if not exists public.product_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null default 1 check (quantity > 0),
  grind_type text,
  frequency_weeks int not null check (frequency_weeks in (2, 4, 6, 8)),
  active boolean not null default true,
  next_reminder_at date not null,
  last_reminded_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists product_subscriptions_due_idx
  on public.product_subscriptions (next_reminder_at)
  where active;

alter table public.product_subscriptions enable row level security;

-- Staff read-only — support/oversight while this is being tried out.
drop policy if exists "kawa staff can read all subscriptions" on public.product_subscriptions;
create policy "kawa staff can read all subscriptions"
  on public.product_subscriptions for select
  using (public.is_kawa_staff());

-- A salarié manages only their own subscriptions. The reminder cron runs as
-- the service role (see lib/supabase/admin.ts), which bypasses RLS entirely.
drop policy if exists "employees can manage their own subscriptions" on public.product_subscriptions;
create policy "employees can manage their own subscriptions"
  on public.product_subscriptions for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
