-- Run this once in the Supabase SQL Editor, after 0001-0032.
--
-- Fixes two real findings from a security audit (2026):
--
-- 1. profiles' "users update own profile" policy (0001) has no `with check`,
--    so it only restricts WHICH ROW can be updated (auth.uid() = id), not
--    which COLUMNS. Any employee could rewrite their own organization_id
--    directly via the Supabase client (bypassing the app's updateProfile
--    action entirely) and pivot into another client company's negotiated
--    discount rates / addresses, since organization_coffee_discounts,
--    organization_addresses and organization_sample_emails all trust
--    profiles.organization_id as the source of truth for "which org am I
--    in". RLS `with check` can't compare against the OLD row, so this needs
--    a trigger, not a policy tweak.
--
-- 2. next_document_number() (0032) is SECURITY DEFINER and was granted to
--    `authenticated` — i.e. every logged-in employee, not just staff/the
--    CAWL webhook — even though it exists specifically to guarantee a
--    gapless, compliance-grade invoice/BL/avoir numbering series. Any
--    employee could call it directly to burn numbers with no document ever
--    issued against them. Fixed by checking authorization inside the
--    function body (auth.role() = 'service_role' covers the webhook, which
--    has no staff JWT to check).

create or replace function public.prevent_unauthorized_profile_org_change()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id is distinct from old.organization_id and not public.is_kawa_staff() then
    raise exception 'Vous ne pouvez pas modifier votre entreprise.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_org_change on public.profiles;
create trigger prevent_profile_org_change
  before update on public.profiles
  for each row
  execute function public.prevent_unauthorized_profile_org_change();

create or replace function public.next_document_number(p_series text, p_year int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number int;
begin
  if not (public.is_kawa_staff() or auth.role() = 'service_role') then
    raise exception 'Non autorisé.';
  end if;

  insert into public.document_sequences (series, year, last_number)
  values (p_series, p_year, 1)
  on conflict (series, year)
  do update set last_number = document_sequences.last_number + 1
  returning last_number into v_number;

  return v_number;
end;
$$;
