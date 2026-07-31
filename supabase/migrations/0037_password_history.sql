-- PCI-DSS SAQ A 8.3.7: a new password must not match any of the last 4 used.
-- Supabase Auth manages its own password hash internally with no API to
-- compare a candidate against past values, so this keeps a small bcrypt
-- history of our own purely for that comparison (lib/password-history.ts) —
-- it's never used to authenticate anyone, only to reject a reused password.

create table if not exists public.password_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.password_history enable row level security;

-- Unlike the MFA bypass column, there's no privilege-escalation risk here —
-- a user reading/pruning their own historical hashes can't grant themselves
-- anything, so a plain auth.uid() = user_id policy is enough (no SECURITY
-- DEFINER function needed).
create policy "users manage own password history"
  on public.password_history for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
