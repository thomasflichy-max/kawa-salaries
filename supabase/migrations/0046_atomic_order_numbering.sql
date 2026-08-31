-- order_number (CMD-{year}-{seq}) was computed in app/actions/checkout.ts
-- from a live `count(*) from orders where created_at >= year-01-01` — not
-- an atomic, never-reused sequence. Every time an order got deleted (a
-- declined/abandoned CAWL payment, a manual test cleanup), the count went
-- back down, so the NEXT checkout could recompute a number that was
-- already used before — e.g. "CMD-2026-0002" got reused for a second,
-- unrelated order after the first one was deleted.
--
-- That's not just cosmetic: order_number is sent to CAWL as
-- references.merchantReference on hostedcheckouts creation (lib/cawl.ts),
-- and CAWL/Worldline rejects a duplicate merchantReference outright —
-- which is exactly the "Une erreur est survenue" a colleague hit trying to
-- check out after several of Thomas's own test orders had been created and
-- deleted, recycling low numbers CAWL had already seen.
--
-- Fix: mint order numbers from the same atomic, gapless document_sequences
-- counter already used for factures/BL/avoirs (migration 0032) — a new
-- 'commande' series, never reused even if the resulting order is later
-- deleted.
do $$
declare
  existing_constraint text;
begin
  select conname into existing_constraint
  from pg_constraint
  where conrelid = 'public.document_sequences'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) like '%series%';

  if existing_constraint is not null then
    execute format('alter table public.document_sequences drop constraint %I', existing_constraint);
  end if;
end $$;

alter table public.document_sequences
  add constraint document_sequences_series_check
  check (series in ('facture', 'bon_livraison', 'avoir', 'commande'));
