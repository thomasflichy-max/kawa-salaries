-- Run this once in the Supabase SQL Editor, after 0001-0013.

alter table public.organizations
  add column if not exists sample_email text;
