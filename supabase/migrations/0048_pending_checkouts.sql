-- Until now, placeOrderAction (app/actions/checkout.ts) inserted a real
-- row into `orders` the moment an employee clicked "Payer", before CAWL
-- had even shown the payment page — visible immediately in Liste Commande
-- and the employee's own order history as "Non payée". Confusing for both
-- sides: staff saw orders that might never be paid, and employees saw a
-- "commande" appear before they'd actually bought anything.
--
-- Fix: stage the checkout in this lightweight table instead of `orders`.
-- The real order only gets created by the webhook once payment.captured
-- actually confirms the purchase (see app/api/webhooks/cawl/route.ts) —
-- if the payment is declined/abandoned, this row is just deleted and the
-- employee's cart is untouched, exactly as if they'd never clicked Payer.
create table public.pending_checkouts (
  order_number text primary key,
  profile_id uuid not null references public.profiles(id),
  organization_id uuid not null references public.organizations(id),
  employee_name text not null,
  employee_email text not null,
  billing_address text not null,
  delivery_mode text not null,
  address text not null,
  amount numeric not null,
  items jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.pending_checkouts enable row level security;

create policy "employees can insert own pending checkouts"
  on public.pending_checkouts for insert
  with check (profile_id = auth.uid());

-- Needed so placeOrderAction can clean up its own reservation if
-- createHostedCheckout fails right after (see app/actions/checkout.ts).
create policy "employees can delete own pending checkouts"
  on public.pending_checkouts for delete
  using (profile_id = auth.uid());

create policy "kawa staff can manage pending checkouts"
  on public.pending_checkouts for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
