-- Run this once in the Supabase SQL Editor, after 0001-0029.
--
-- Lets staff interact with the "Canal d'inscriptions" feed
-- (app/admin/inscriptions) like a real chat channel: emoji reactions and
-- comment threads on each signup attempt. Purely an internal admin tool —
-- unlike signup_attempts itself, nothing here needs an open/anonymous
-- write policy, so both tables are staff-only end to end.

create table public.signup_attempt_reactions (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.signup_attempts(id) on delete cascade,
  emoji text not null,
  staff_email text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (attempt_id, emoji, staff_email)
);

create table public.signup_attempt_comments (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.signup_attempts(id) on delete cascade,
  author_email text not null,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.signup_attempt_reactions enable row level security;
alter table public.signup_attempt_comments enable row level security;

drop policy if exists "kawa staff can manage signup attempt reactions" on public.signup_attempt_reactions;
create policy "kawa staff can manage signup attempt reactions"
  on public.signup_attempt_reactions for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "kawa staff can manage signup attempt comments" on public.signup_attempt_comments;
create policy "kawa staff can manage signup attempt comments"
  on public.signup_attempt_comments for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
