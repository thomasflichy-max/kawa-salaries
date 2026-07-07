-- Run this once in the Supabase SQL Editor, after 0001-0009.
--
-- Some machines are "sur demande" (no fixed price, no direct purchase) — the
-- employee submits interest instead of adding to cart.

alter table public.products
  add column if not exists purchasable boolean not null default true;

create table if not exists public.machine_interest_requests (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.machine_interest_requests enable row level security;

drop policy if exists "users can submit own interest requests" on public.machine_interest_requests;
create policy "users can submit own interest requests"
  on public.machine_interest_requests for insert
  with check (auth.uid() = user_id);

drop policy if exists "kawa staff can read interest requests" on public.machine_interest_requests;
create policy "kawa staff can read interest requests"
  on public.machine_interest_requests for select
  using (public.is_kawa_staff());
