-- Run this once in the Supabase SQL Editor, after 0001-0050.
--
-- Commercial prospection (newsletter / offres) to employees who have ordered
-- through the platform. Legal basis: the "clients existants" carve-out of
-- art. L34-5 CPCE — no consent checkbox (that would be forced consent and
-- invalid), instead an information notice shown at checkout + an easy opt-out
-- everywhere.
--
--   marketing_notice_ack_at : first time the person reached checkout and was
--                             shown the prospection notice (audit trail).
--   marketing_opt_out       : they asked to stop receiving it.
--   marketing_unsub_token   : unguessable per-profile token for the one-click
--                             unsubscribe link in emails (no session needed).

alter table public.profiles
  add column if not exists marketing_opt_out boolean not null default false,
  add column if not exists marketing_notice_ack_at timestamptz,
  add column if not exists marketing_unsub_token uuid not null default gen_random_uuid();

-- One-click unsubscribe from a link in a marketing email — the recipient has
-- no session, so this is keyed on the random token, not auth.uid().
create or replace function public.unsubscribe_marketing(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean;
begin
  update public.profiles
    set marketing_opt_out = true
  where marketing_unsub_token = p_token
  returning true into v_found;
  return coalesce(v_found, false);
end;
$$;

grant execute on function public.unsubscribe_marketing(uuid) to anon, authenticated;
