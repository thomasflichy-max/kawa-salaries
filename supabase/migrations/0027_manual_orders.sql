-- Run this once in the Supabase SQL Editor, after 0001-0026.
--
-- Real, persisted orders for commandes created manually by KAWA staff from
-- /admin/commandes (e.g. over phone/email, before the real checkout pipeline
-- exists) — unlike DEMO_ORDERS (app/admin/demo-data.ts), these survive
-- redeploys since real money/payment links are involved. Deliberately not
-- the full order model the eventual checkout pipeline will need (no
-- prep/delivery status flow, no refunds) — see app/admin/commandes/manual-orders.ts.
--
-- employee_name/employee_email/billing_address are snapshots taken at
-- creation time, same convention as everywhere else in this schema: an
-- order must not silently change if the profile is edited afterwards.

create table public.manual_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid not null references public.profiles(id),
  organization_id uuid not null references public.organizations(id),
  employee_name text not null,
  employee_email text not null,
  billing_address text not null,
  delivery_mode text not null check (delivery_mode in ('delivery', 'pickup')),
  address text not null,
  amount numeric not null,
  paid boolean not null default false,
  payment_link text,
  created_at timestamptz not null default timezone('utc', now()),
  created_by text
);

create table public.manual_order_items (
  id uuid primary key default gen_random_uuid(),
  manual_order_id uuid not null references public.manual_orders(id) on delete cascade,
  product_name text not null,
  quantity int not null check (quantity > 0),
  image_url text not null,
  unit text not null check (unit in ('Kg', 'unité')),
  unit_price_ttc numeric not null,
  vat_rate numeric not null
);

alter table public.manual_orders enable row level security;
alter table public.manual_order_items enable row level security;

drop policy if exists "kawa staff can manage manual orders" on public.manual_orders;
create policy "kawa staff can manage manual orders"
  on public.manual_orders for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own manual orders" on public.manual_orders;
create policy "employees can read own manual orders"
  on public.manual_orders for select
  using (profile_id = auth.uid());

drop policy if exists "kawa staff can manage manual order items" on public.manual_order_items;
create policy "kawa staff can manage manual order items"
  on public.manual_order_items for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own manual order items" on public.manual_order_items;
create policy "employees can read own manual order items"
  on public.manual_order_items for select
  using (
    manual_order_id in (
      select id from public.manual_orders where profile_id = auth.uid()
    )
  );
