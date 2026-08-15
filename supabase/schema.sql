-- =============================================================================
-- Odhyay production schema for Supabase (PostgreSQL)
-- Migrate from the legacy MySQL schema (drizzle/schema.ts).
-- Run in the Supabase SQL editor, or via: supabase db push
--
-- Identities are now stored in auth.users (Supabase Auth). App rows in
-- `users` are mirrors keyed by `supabaseUserId`, with FKs from the reading
-- tables pointing at `users.id`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enum types
-- -----------------------------------------------------------------------------

create type public.user_role as enum ('user', 'admin', 'super_admin');
create type public.book_status as enum ('draft', 'published');

-- -----------------------------------------------------------------------------
-- users (mirror of auth.users)
-- -----------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email varchar(320),
  role public.user_role not null default 'user',
  last_signed_in timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_uq on public.users (email)
  where email is not null;

-- -----------------------------------------------------------------------------
-- authors
-- -----------------------------------------------------------------------------

create table if not exists public.authors (
  id bigint generated always as identity primary key,
  name varchar(240) not null,
  bio text,
  created_at timestamptz not null default now(),
  constraint authors_name_uq unique (name)
);

-- -----------------------------------------------------------------------------
-- categories
-- -----------------------------------------------------------------------------

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name varchar(160) not null,
  slug varchar(180) not null,
  description text,
  created_at timestamptz not null default now(),
  constraint categories_name_uq unique (name),
  constraint categories_slug_uq unique (slug)
);

-- -----------------------------------------------------------------------------
-- books
-- -----------------------------------------------------------------------------

create table if not exists public.books (
  id bigint generated always as identity primary key,
  title varchar(400) not null,
  slug varchar(460) not null,
  description text not null,
  cover_url text,
  pdf_key varchar(512),
  author_id bigint not null references public.authors (id) on delete restrict,
  category_id bigint references public.categories (id) on delete set null,
  page_count integer not null default 0,
  status public.book_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint books_slug_uq unique (slug)
);

create index if not exists books_status_idx on public.books (status);
create index if not exists books_category_idx on public.books (category_id);

-- -----------------------------------------------------------------------------
-- reading_progress
-- -----------------------------------------------------------------------------

create table if not exists public.reading_progress (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  book_id bigint not null references public.books (id) on delete cascade,
  current_page integer not null default 1,
  progress_percentage integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint reading_progress_user_book_uq unique (user_id, book_id)
);

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  book_id bigint not null references public.books (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_book_uq unique (user_id, book_id)
);

-- -----------------------------------------------------------------------------
-- bookmarks
-- -----------------------------------------------------------------------------

create table if not exists public.bookmarks (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.users (id) on delete cascade,
  book_id bigint not null references public.books (id) on delete cascade,
  page_number integer not null,
  created_at timestamptz not null default now(),
  constraint bookmarks_user_book_page_uq unique (user_id, book_id, page_number)
);

-- -----------------------------------------------------------------------------
-- updated_at trigger
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();
