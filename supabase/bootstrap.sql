-- =============================================================================
-- Odhyay: bootstrap tables + create the first admin.
-- The application role model is `user` / `admin`; there is no `super_admin` role.
-- Run AFTER schema.sql and rls.sql.
--
-- 1. Create a user in Supabase Auth (Dashboard -> Authentication -> Add user)
--    with the email address you want for the first admin.
-- 2. Replace <SUPER_ADMIN@EMAIL> below with that email and run this script.
-- 3. Optionally seed starter categories and an author.
-- =============================================================================

-- Manually promote the first user to admin.
-- (The server-side admin checks can also use a SUPABASE_ADMIN_EMAILS override
-- env var as a backup; see server/_core/env.ts.)
update public.users
set role = 'admin'
where email = '<SUPER_ADMIN@EMAIL>';

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