-- Run this once in the Supabase SQL Editor, after 0001-0031.
--
-- Dedicated, gapless sequential numbering + immutable PDF archiving for
-- factures/BL/justificatifs de remboursement on REAL (CAWL checkout)
-- orders. Until now these documents used order_number as their reference
-- and were re-rendered on demand from live order data — two real
-- compliance gaps: order_number can develop gaps (a cancelled/deleted
-- order skips a number, as happened during testing), and a document
-- re-rendered later can differ from what was originally issued if the
-- underlying order data (e.g. billing address) changes in the meantime.
-- See app/api/webhooks/cawl/route.ts and app/admin/commandes/actions.ts
-- for where these get minted.

-- One row per (document series, year); next_document_number() is the only
-- way any code should ever get a number, and does so atomically via
-- Postgres's row-level locking on `on conflict do update` — safe even if
-- two webhook deliveries race.
create table public.document_sequences (
  series text not null check (series in ('facture', 'bon_livraison', 'avoir')),
  year int not null,
  last_number int not null default 0,
  primary key (series, year)
);

alter table public.document_sequences enable row level security;

drop policy if exists "kawa staff can manage document sequences" on public.document_sequences;
create policy "kawa staff can manage document sequences"
  on public.document_sequences for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

create or replace function public.next_document_number(p_series text, p_year int)
returns int
language sql
security definer
set search_path = public
as $$
  insert into public.document_sequences (series, year, last_number)
  values (p_series, p_year, 1)
  on conflict (series, year)
  do update set last_number = document_sequences.last_number + 1
  returning last_number;
$$;

grant execute on function public.next_document_number(text, int) to authenticated, service_role;

alter table public.orders
  add column invoice_number text unique,
  add column invoice_pdf_path text,
  add column delivery_note_number text unique,
  add column delivery_note_pdf_path text;

alter table public.order_refunds
  add column refund_number text unique,
  add column pdf_path text;

-- Private bucket for the archived PDFs. No employee-facing read policy:
-- every document download today goes through a staff-gated Next.js route
-- (isKawaStaffEmail), not a direct Storage URL — nothing to expose yet.
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

drop policy if exists "kawa staff can manage documents" on storage.objects;
create policy "kawa staff can manage documents"
  on storage.objects for all
  using (bucket_id = 'documents' and public.is_kawa_staff())
  with check (bucket_id = 'documents' and public.is_kawa_staff());
