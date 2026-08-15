-- =============================================================================
-- Odhyay: bootstrap tables + create the first super admin.
-- The application role model is `user` / `admin` / `super_admin`.
-- This script mirrors the selected auth.users row before promoting it.
-- Run AFTER schema.sql and rls.sql.
--
-- 1. Create a user in Supabase Auth (Dashboard -> Authentication -> Add user)
--    with the email address you want for the first super admin.
-- 2. Replace <SUPER_ADMIN@EMAIL> below with that exact email and run this script.
-- 3. Optionally seed starter categories and an author.
-- =============================================================================

-- Mirror the Auth identity into the application users table, then promote it.
insert into public.users (id, name, email, role)
select id,
       coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email),
       lower(email),
       'super_admin'
from auth.users
where lower(email) = lower('<SUPER_ADMIN@EMAIL>')
on conflict (id) do update
set name = excluded.name,
    email = excluded.email,
    role = 'super_admin',
    updated_at = now();

-- -----------------------------------------------------------------------------
-- Starter categories (optional seed data)
-- -----------------------------------------------------------------------------

insert into public.categories (name, slug, description)
values
  ('Fiction', 'fiction', 'Novels, short stories and literary works.'),
  ('Non-Fiction', 'non-fiction', 'Memoir, history, essays and reference.'),
  ('Science', 'science', 'Popular science and technical deep dives.'),
  ('Self-Help', 'self-help', 'Personal growth and practical guidance.')
on conflict (name) do nothing;

-- -----------------------------------------------------------------------------
-- Starter author (optional seed data)
-- -----------------------------------------------------------------------------

insert into public.authors (name, bio)
values ('Anonymous', 'Author accounts are created when uploading the first book.')
on conflict (name) do nothing;