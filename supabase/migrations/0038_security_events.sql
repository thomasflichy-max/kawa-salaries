-- Feed of suspicious activity for the new "Canal de sécurité" admin page —
-- same open-insert/staff-only-read shape as signup_attempts (0029): the
-- actor triggering an insert here (a failed login, a rejected admin-signup,
-- an unauthorized /admin hit, a forged CAWL webhook) is by definition not
-- someone we can gate the insert behind, and there's nothing sensitive to
-- read back (no password/secret is ever stored in `detail`).
create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  email text,
  detail text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.security_events enable row level security;

create policy "kawa staff can read security events"
  on public.security_events for select
  using (public.is_kawa_staff());

create policy "anyone can insert security events"
  on public.security_events for insert
  with check (true);
