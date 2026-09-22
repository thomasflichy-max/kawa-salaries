-- Run this once in the Supabase SQL Editor, after 0001-0056.
--
-- Lightweight interest poll: "le format 200g vous intéresserait-il ?" shown
-- on a coffee's product page (every coffee except the déca, already sold in
-- 200g — gated in app code on net_weight_grams, not here). One row = one
-- salarié saying yes for one product; withdrawing a vote just deletes the
-- row. Staff read the aggregate on the dashboard.

create table if not exists public.product_interest_votes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (product_id, profile_id)
);

create index if not exists product_interest_votes_product_id_idx
  on public.product_interest_votes (product_id);

alter table public.product_interest_votes enable row level security;

drop policy if exists "kawa staff can read all product interest votes"
  on public.product_interest_votes;
create policy "kawa staff can read all product interest votes"
  on public.product_interest_votes for select
  using (public.is_kawa_staff());

drop policy if exists "employees can manage their own product interest vote"
  on public.product_interest_votes;
create policy "employees can manage their own product interest vote"
  on public.product_interest_votes for all
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
