-- =============================================================================
-- Odhyay Row Level Security policies (Supabase)
-- Run AFTER schema.sql (tables must exist).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helper: current app user id. Uses Supabase Auth JWT. Server-side code
-- (tRPC) bypasses RLS via the service-role key.
-- -----------------------------------------------------------------------------

create or replace function public.app_user_id()
returns uuid
language sql
stable
as $$
  select auth.uid()
$$;

-- -----------------------------------------------------------------------------
-- users
-- Users can read their own row. RLS blocks user edits; profile changes go
-- through the server (service role).
-- -----------------------------------------------------------------------------

alter table public.users enable row level security;

create policy "users_select_own" on public.users
  for select
  to authenticated
  using (public.app_user_id() = id);

-- -----------------------------------------------------------------------------
-- authors (public read)
-- -----------------------------------------------------------------------------

alter table public.authors enable row level security;

create policy "authors_select_public" on public.authors
  for select
  to authenticated
  using (true);

create policy "authors_select_anon" on public.authors
  for select
  to anon
  using (true);

-- -----------------------------------------------------------------------------
-- categories (public read)
-- -----------------------------------------------------------------------------

alter table public.categories enable row level security;

create policy "categories_select_public" on public.categories
  for select
  to authenticated
  using (true);

create policy "categories_select_anon" on public.categories
  for select
  to anon
  using (true);

-- -----------------------------------------------------------------------------
-- books
-- RLS: published books readable by everyone; drafts only visible via server
-- (admin) using the service-role key.
-- -----------------------------------------------------------------------------

alter table public.books enable row level security;

create policy "books_select_published" on public.books
  for select
  to authenticated, anon
  using (status = 'published');

create policy "books_select_draft_admin" on public.books
  for select
  to authenticated
  using (status = 'draft' and exists (
    select 1 from public.users u where u.id = public.app_user_id() and u.role = 'admin'
  ));

-- -----------------------------------------------------------------------------
-- reading_progress (own rows)
-- -----------------------------------------------------------------------------

alter table public.reading_progress enable row level security;

create policy "reading_progress_select_own" on public.reading_progress
  for select
  to authenticated
  using (public.app_user_id() = user_id);

create policy "reading_progress_insert_own" on public.reading_progress
  for insert
  to authenticated
  with check (public.app_user_id() = user_id);

create policy "reading_progress_update_own" on public.reading_progress
  for update
  to authenticated
  using (public.app_user_id() = user_id)
  with check (public.app_user_id() = user_id);

create policy "reading_progress_delete_own" on public.reading_progress
  for delete
  to authenticated
  using (public.app_user_id() = user_id);

-- -----------------------------------------------------------------------------
-- favorites (own rows)
-- -----------------------------------------------------------------------------

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select
  to authenticated
  using (public.app_user_id() = user_id);

create policy "favorites_insert_own" on public.favorites
  for insert
  to authenticated
  with check (public.app_user_id() = user_id);

create policy "favorites_delete_own" on public.favorites
  for delete
  to authenticated
  using (public.app_user_id() = user_id);

-- -----------------------------------------------------------------------------
-- bookmarks (own rows)
-- -----------------------------------------------------------------------------

alter table public.bookmarks enable row level security;

create policy "bookmarks_select_own" on public.bookmarks
  for select
  to authenticated
  using (public.app_user_id() = user_id);

create policy "bookmarks_insert_own" on public.bookmarks
  for insert
  to authenticated
  with check (public.app_user_id() = user_id);

create policy "bookmarks_delete_own" on public.bookmarks
  for delete
  to authenticated
  using (public.app_user_id() = user_id);

-- -----------------------------------------------------------------------------
-- Storage: public `covers` bucket (images, read by anon/authenticated)
-- Uploads in a public bucket may be public, but only server/admin writes.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers_select_public" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'covers');

create policy "covers_insert_public" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'covers');

create policy "covers_delete_public" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'covers');

-- -----------------------------------------------------------------------------
-- Storage: private `books` bucket (PDFs; reading happens server-side with a
-- signed/streamed URL, so the bucket must NOT be publicly readable).
-- The signed URL policy lets the server create short-lived download links.
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('books', 'books', false)
on conflict (id) do nothing;

create policy "books_select_signed" on storage.objects
  for select
  to authenticated
  using (bucket_id = 'books');

create policy "books_insert_public" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'books');

create policy "books_delete_public" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'books');