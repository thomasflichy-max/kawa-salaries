-- migration 0046 started minting order_number via next_document_number()
-- with series='commande' — but that function was deliberately restricted
-- to staff/service_role by migration 0033, specifically to stop an
-- employee from burning FACTURE/BL/AVOIR numbers with no real document
-- ever issued against them. Calling it from the employee-facing checkout
-- action hits that same guard: "Non autorisé." for every non-staff
-- session (confirmed in production, Brieuc's checkout attempts).
--
-- Fix: a separate function, hardcoded to the 'commande' series only (it
-- cannot be called with any other series, so it can never be used to burn
-- a facture/BL/avoir number) — granted broadly to `authenticated`, since
-- an order number being consumed by an abandoned/failed checkout is a
-- normal, expected occurrence, unlike a real invoice number.
create or replace function public.next_order_number(p_year int)
returns int
language sql
security definer
set search_path = public
as $$
  insert into public.document_sequences (series, year, last_number)
  values ('commande', p_year, 1)
  on conflict (series, year)
  do update set last_number = document_sequences.last_number + 1
  returning last_number;
$$;

grant execute on function public.next_order_number(int) to authenticated, service_role;
