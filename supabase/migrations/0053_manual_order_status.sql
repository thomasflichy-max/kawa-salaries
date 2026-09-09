-- Run this once in the Supabase SQL Editor, after 0001-0052.
--
-- Gives manually-created orders (0027) the same prep/delivery status
-- lifecycle as real checkout orders (0031): en_cours -> en_preparation ->
-- pret -> livree, plus annulee. Until now manual_orders only tracked paid,
-- so /admin/commandes couldn't advance their status.

alter table public.manual_orders
  add column if not exists status text not null default 'en_cours'
  check (status in ('en_cours', 'en_preparation', 'pret', 'livree', 'annulee'));

create table if not exists public.manual_order_status_history (
  id uuid primary key default gen_random_uuid(),
  manual_order_id uuid not null references public.manual_orders(id) on delete cascade,
  actor text not null,
  action text not null,
  at timestamptz not null default timezone('utc', now())
);

alter table public.manual_order_status_history enable row level security;

drop policy if exists "kawa staff can manage manual order status history"
  on public.manual_order_status_history;
create policy "kawa staff can manage manual order status history"
  on public.manual_order_status_history for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own manual order status history"
  on public.manual_order_status_history;
create policy "employees can read own manual order status history"
  on public.manual_order_status_history for select
  using (
    manual_order_id in (
      select id from public.manual_orders where profile_id = auth.uid()
    )
  );
