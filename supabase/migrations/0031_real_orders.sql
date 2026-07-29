-- Run this once in the Supabase SQL Editor, after 0001-0030.
--
-- Real checkout pipeline: an employee pays via CAWL (Crédit Agricole) hosted
-- checkout, redirect-only (PCI DSS SAQ A — see payment module notes). This
-- replaces app/admin/demo-data.ts (DEMO_ORDERS, in-memory) as the source for
-- orders actually placed through /compte/panier, alongside manual_orders
-- (0027/0028, staff-entered phone/email orders) which this does not replace.
--
-- The pre-existing `orders` table predates migration tracking and is never
-- read or written by any app code (grep confirms zero hits) — its schema
-- (total_amount/status free text, no order_items) doesn't fit what a real
-- checkout needs. Renamed rather than dropped, in case it's ever needed for
-- reference.
alter table public.orders rename to orders_legacy_unused;

-- employee_name/employee_email/billing_address/address are snapshots taken
-- at order-creation time — same convention as manual_orders: an order must
-- not silently change if the profile is edited afterwards.
--
-- status: the prep/delivery lifecycle, same values as DemoOrderStatus.
-- payment_status: the CAWL payment lifecycle, updated by the webhook
-- (app/api/webhooks/cawl/route.ts). `paid` is kept in sync with
-- payment_status = 'paye' so existing code that only knows the DemoOrder
-- shape (paid: boolean) keeps working unmodified.
create table public.orders (
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
  status text not null default 'en_cours'
    check (status in ('en_cours', 'en_preparation', 'pret', 'livree', 'annulee')),
  payment_status text not null default 'en_attente'
    check (payment_status in ('en_attente', 'paye', 'echoue', 'rembourse', 'annule')),
  paid boolean not null default false,
  cawl_hosted_checkout_id text,
  cawl_payment_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  quantity int not null check (quantity > 0),
  image_url text not null,
  unit text not null check (unit in ('Kg', 'unité')),
  unit_price_ttc numeric not null,
  vat_rate numeric not null
);

-- Mirrors DemoOrderHistoryEntry — powers the same order-detail timeline UI
-- for real orders as for demo/seed ones.
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  actor text not null,
  action text not null,
  at timestamptz not null default timezone('utc', now())
);

-- Mirrors DemoOrderRefund — a refund is its own record (not a boolean) so an
-- order can accumulate several partial refunds over time.
create table public.order_refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  amount numeric not null,
  reason text not null,
  actor text not null,
  at timestamptz not null default timezone('utc', now())
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_refunds enable row level security;

drop policy if exists "kawa staff can manage orders" on public.orders;
create policy "kawa staff can manage orders"
  on public.orders for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

-- Unlike manual_orders (staff-only insert), the employee places their own
-- order via the checkout server action, using their own session — so they
-- need insert rights on their own row, not just select.
drop policy if exists "employees can read own orders" on public.orders;
create policy "employees can read own orders"
  on public.orders for select
  using (profile_id = auth.uid());

drop policy if exists "employees can insert own orders" on public.orders;
create policy "employees can insert own orders"
  on public.orders for insert
  with check (profile_id = auth.uid());

drop policy if exists "kawa staff can manage order items" on public.order_items;
create policy "kawa staff can manage order items"
  on public.order_items for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own order items" on public.order_items;
create policy "employees can read own order items"
  on public.order_items for select
  using (order_id in (select id from public.orders where profile_id = auth.uid()));

-- The checkout action inserts order_items right after orders, still under
-- the employee's own session — needs the same insert-own-order-scoped right.
drop policy if exists "employees can insert own order items" on public.order_items;
create policy "employees can insert own order items"
  on public.order_items for insert
  with check (order_id in (select id from public.orders where profile_id = auth.uid()));

drop policy if exists "kawa staff can manage order status history" on public.order_status_history;
create policy "kawa staff can manage order status history"
  on public.order_status_history for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own order status history" on public.order_status_history;
create policy "employees can read own order status history"
  on public.order_status_history for select
  using (order_id in (select id from public.orders where profile_id = auth.uid()));

drop policy if exists "kawa staff can manage order refunds" on public.order_refunds;
create policy "kawa staff can manage order refunds"
  on public.order_refunds for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "employees can read own order refunds" on public.order_refunds;
create policy "employees can read own order refunds"
  on public.order_refunds for select
  using (order_id in (select id from public.orders where profile_id = auth.uid()));
