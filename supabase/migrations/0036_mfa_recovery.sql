-- MFA (0034... actually the TOTP enrollment feature added in the app) has
-- no built-in "lost my device" recovery — Supabase's MFA API only supports
-- totp/phone/webauthn factors, no native recovery-code concept. This adds
-- one-time recovery codes, checked via a SECURITY DEFINER RPC rather than a
-- direct table write from the client, for a specific reason:
--
-- profiles.mfa_recovery_bypass_until (added below) must NEVER be settable by
-- a plain client update — every admin account is "is_kawa_staff" by
-- definition (any @kawa.coffee email), so if an attacker only had a stolen
-- password (a valid but aal1-only session), they could otherwise just call
-- `supabase.from('profiles').update({ mfa_recovery_bypass_until: ... })`
-- directly and skip MFA entirely, defeating the whole point. The trigger
-- below blocks that column from being touched by anything except the
-- consume_mfa_recovery_code() function itself, which sets a local,
-- per-transaction flag right before making the authorized change — nothing
-- else can set that flag, and it never persists outside the function call.

create table if not exists public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

-- RLS enabled with zero policies granted to `authenticated` — on purpose.
-- All access goes through the two SECURITY DEFINER functions below, each
-- internally scoped to auth.uid(), so there's nothing for a policy to grant.
alter table public.mfa_recovery_codes enable row level security;

alter table public.profiles
  add column if not exists mfa_recovery_bypass_until timestamptz;

create or replace function public.prevent_unauthorized_mfa_bypass_change()
returns trigger
language plpgsql
as $$
begin
  if new.mfa_recovery_bypass_until is distinct from old.mfa_recovery_bypass_until
     and coalesce(current_setting('app.granting_mfa_bypass', true), '') <> 'true' then
    raise exception 'Vous ne pouvez pas modifier ce champ.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_mfa_bypass_change on public.profiles;
create trigger prevent_mfa_bypass_change
  before update on public.profiles
  for each row
  execute function public.prevent_unauthorized_mfa_bypass_change();

-- Called once a TOTP factor is verified (app/admin/securite/actions.ts,
-- verifyMfaEnrollment) — replaces any existing codes for this user, so
-- re-enrolling invalidates old ones. Hashes are computed in Node (SHA-256)
-- before being passed in; this function never sees plaintext codes.
create or replace function public.generate_mfa_recovery_codes(p_code_hashes text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.mfa_recovery_codes where user_id = auth.uid();

  insert into public.mfa_recovery_codes (user_id, code_hash)
  select auth.uid(), h from unnest(p_code_hashes) as h;
end;
$$;

grant execute on function public.generate_mfa_recovery_codes(text[]) to authenticated;

-- Called from the /connexion/mfa "use a recovery code" fallback. Marks the
-- code used (single-use) and grants a 12h bypass window on success — see
-- the trigger above for why this is the only path allowed to do that.
create or replace function public.consume_mfa_recovery_code(p_code_hash text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  select id into v_id
  from public.mfa_recovery_codes
  where user_id = auth.uid() and code_hash = p_code_hash and used_at is null
  limit 1;

  if v_id is null then
    return false;
  end if;

  update public.mfa_recovery_codes set used_at = now() where id = v_id;

  perform set_config('app.granting_mfa_bypass', 'true', true);
  update public.profiles set mfa_recovery_bypass_until = now() + interval '12 hours' where id = auth.uid();

  return true;
end;
$$;

grant execute on function public.consume_mfa_recovery_code(text) to authenticated;
