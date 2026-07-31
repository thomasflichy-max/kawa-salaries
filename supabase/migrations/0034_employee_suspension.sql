-- Lets staff suspend a single employee's account (e.g. they've left the
-- company, account abuse) without deleting their profile or order history —
-- the org-level "active" toggle in 0001 is too broad for this.

alter table public.profiles
  add column if not exists is_suspended boolean not null default false;

-- Same reasoning as prevent_unauthorized_profile_org_change (0033): RLS
-- `with check` can't compare against the OLD row, so blocking an employee
-- from un-suspending themselves via a direct Supabase client call needs a
-- trigger, not a policy tweak.
create or replace function public.prevent_unauthorized_profile_suspension_change()
returns trigger
language plpgsql
as $$
begin
  if new.is_suspended is distinct from old.is_suspended and not public.is_kawa_staff() then
    raise exception 'Vous ne pouvez pas modifier ce champ.';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_suspension_change on public.profiles;
create trigger prevent_profile_suspension_change
  before update on public.profiles
  for each row
  execute function public.prevent_unauthorized_profile_suspension_change();
