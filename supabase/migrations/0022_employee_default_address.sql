-- Run this once in the Supabase SQL Editor, after 0001-0021.
--
-- A salarié can set a default delivery choice among their company's
-- registered sites — NULL means "Retrait KAWA Nantes" (always available,
-- no row needed for it). They can still pick a different one later at
-- checkout; this is just a saved preference, not a lock-in.

alter table public.profiles
  add column if not exists default_address_id uuid references public.organization_addresses(id) on delete set null;
