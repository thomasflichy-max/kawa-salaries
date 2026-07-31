-- The 3 profiles triggers that block unauthorized direct-client changes
-- (0033 organization_id, 0034 is_suspended, 0036 mfa_recovery_bypass_until)
-- all currently `raise exception` — but raising aborts the WHOLE
-- transaction, which would also roll back any security_events insert made
-- moments earlier in the same trigger call. So instead of raising, each one
-- now logs the attempt then returns null (Postgres skips the row update for
-- a BEFORE ROW trigger that returns null — the request still "succeeds"
-- with the row simply unchanged, same silent-no-op shape already handled
-- elsewhere in this app, e.g. suspendEmployee checking for a 0-row result).
--
-- Not security definer — security_events' insert policy is wide open
-- (with check (true), see 0038), so the calling (unauthorized) role can
-- already insert into it directly; no elevated privilege needed here.

create or replace function public.prevent_unauthorized_profile_org_change()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id is distinct from old.organization_id and not public.is_kawa_staff() then
    insert into public.security_events (event_type, email, detail)
    values (
      'unauthorized_profile_change',
      auth.jwt() ->> 'email',
      'organization_id; profile_id=' || old.id
    );
    return null;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_unauthorized_profile_suspension_change()
returns trigger
language plpgsql
as $$
begin
  if new.is_suspended is distinct from old.is_suspended and not public.is_kawa_staff() then
    insert into public.security_events (event_type, email, detail)
    values (
      'unauthorized_profile_change',
      auth.jwt() ->> 'email',
      'is_suspended; profile_id=' || old.id
    );
    return null;
  end if;
  return new;
end;
$$;

create or replace function public.prevent_unauthorized_mfa_bypass_change()
returns trigger
language plpgsql
as $$
begin
  if new.mfa_recovery_bypass_until is distinct from old.mfa_recovery_bypass_until
     and coalesce(current_setting('app.granting_mfa_bypass', true), '') <> 'true' then
    insert into public.security_events (event_type, email, detail)
    values (
      'unauthorized_profile_change',
      auth.jwt() ->> 'email',
      'mfa_recovery_bypass_until; profile_id=' || old.id
    );
    return null;
  end if;
  return new;
end;
$$;
