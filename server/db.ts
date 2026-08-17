import type { User as AuthUser } from "@supabase/supabase-js";
import { toBookRecord, toCategoryRecord, toUser } from "./_core/mappers.js";
import type { BookRecord, CategoryRecord, CreateBookInput, User } from "./types.js";
import { getSupabase } from "./_core/supabase.js";

function requireDb() {
  return getSupabase();
}

export function toSlug(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "untitled"
  );
}

/**
 * Fetch the app-side `users` mirror for a Supabase auth user, creating it when
 * it does not exist yet. New users start as `user`; admin roles are assigned in the database bootstrap/admin workflow.
 */
export async function getOrCreateUserFromAuth(authUser: AuthUser): Promise<User> {
  const db = requireDb();
  const email = (authUser.email ?? authUser.user_metadata?.email ?? null)?.toString().toLowerCase() ?? null;
  const rawName = authUser.user_metadata?.full_name ?? authUser.user_metadata?.name ?? authUser.email ?? null;
  const name = typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;
  const role: "user" = "user";

  const { data: existing } = await db
    .from("users")
    .select("id,name,email,role,last_signed_in,created_at,updated_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (existing) {
    const stale = Date.now() - new Date(existing.last_signed_in).getTime() > 5 * 60 * 1000;
    if (stale || existing.name !== name || existing.email !== email) {
      await db
        .from("users")
        .update({ name, email, last_signed_in: new Date().toISOString() })
        .eq("id", authUser.id);
    }
    return toUser({ ...existing, name: existing.name ?? name, email: existing.email ?? email });
  }

  await db
    .from("users")
    .upsert(
      { id: authUser.id, name, email, role, last_signed_in: new Date().toISOString() },
      { onConflict: "id" },
    );
  const { data: created } = await db
    .from("users")
    .select("id,name,email,role,last_signed_in,created_at,updated_at")
    .eq("id", authUser.id)
    .single();
  if (!created) {
    throw new Error("Failed to create the app user record.");
  }
  return toUser(created);
}

export async function listCategories(): Promise<CategoryRecord[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("categories")
    .select("id,name,slug,description,created_at")
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(toCategoryRecord);
}

type ListBooksInput = {
  query?: string;
  categorySlug?: string;
  includeDrafts?: boolean;
};

const pick = <T,>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

export async function listBooks(input: ListBooksInput = {}): Promise<BookRecord[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("books")
    .select(
      "id,title,slug,description,cover_url,pdf_key,page_count,status,created_at,updated_at,authors(name),categories(name,slug)",
    )
    .order("updated_at", { ascending: false });
  if (error) throw error;

  let rows = data ?? [];
  if (!input.includeDrafts) {
    rows = rows.filter((row) => row.status === "published");
  }
  if (input.categorySlug) {
    rows = rows.filter((row) => pick(row.categories)?.slug === input.categorySlug);
  }
  if (input.query) {
    const needle = input.query.trim().toLowerCase();
    rows = rows.filter(
      (row) =>
        row.title.toLowerCase().includes(needle) ||
        pick(row.authors)?.name?.toLowerCase().includes(needle) ||
        pick(row.categories)?.name?.toLowerCase().includes(needle),
    );
  }
  return rows.map(toBookRecord);
}

export async function getBookBySlug(slug: string, includeDrafts = false): Promise<BookRecord | undefined> {
  const db = requireDb();
  let query = db
    .from("books")
    .select(
      "id,title,slug,description,cover_url,pdf_key,page_count,status,created_at,updated_at,authors(name),categories(name,slug)",
    )
    .eq("slug", slug);

  if (!includeDrafts) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return undefined;
  return toBookRecord(data);
}

async function ensureAuthor(name: string): Promise<number> {
  const db = requireDb();
  const { data: found } = await db.from("authors").select("id").eq("name", name).maybeSingle();
  if (found) return found.id;
  const { data: created, error } = await db.from("authors").insert({ name }).select("id").single();
  if (error) throw error;
  return created.id;
}

async function ensureCategory(name: string): Promise<number> {
  const db = requireDb();
  const { data: found } = await db.from("categories").select("id").eq("name", name).maybeSingle();
  if (found) return found.id;
  const base = toSlug(name);
  let slug = base;
  let suffix = 2;
  while (await categorySlugExists(slug)) {
    slug = `${base}-${suffix++}`;
  }
  const { data: created, error } = await db
    .from("categories")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

async function categorySlugExists(slug: string): Promise<boolean> {
  const db = requireDb();
  const { data } = await db.from("categories").select("id").eq("slug", slug).maybeSingle();
  return Boolean(data);
}

export async function createBook(input: CreateBookInput) {
  const db = requireDb();
  const authorId = await ensureAuthor(input.authorName.trim());
  const categoryId = await ensureCategory(input.categoryName.trim());
  const base = toSlug(input.title);
  let slug = base;
  let suffix = 2;
  while (await bookSlugExists(slug)) {
    slug = `${base}-${suffix++}`;
  }
  const { data, error } = await db
    .from("books")
    .insert({
      title: input.title.trim(),
      slug,
      description: input.description.trim(),
      author_id: authorId,
      category_id: categoryId,
      page_count: input.pageCount ?? 0,
      status: input.status,
      cover_url: input.coverUrl ?? null,
      pdf_key: input.pdfKey ?? null,
    })
    .select("id,slug")
    .single();
  if (error) throw error;
  return { id: data.id, slug: data.slug };
}

export async function updateBook(input: {
  id: number;
  title?: string;
  authorName?: string;
  categoryName?: string;
  description?: string;
  pageCount?: number;
  status?: "draft" | "published";
  coverUrl?: string | null;
  pdfKey?: string | null;
}) {
  const db = requireDb();
  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.pageCount !== undefined) updates.page_count = input.pageCount;
  if (input.status !== undefined) updates.status = input.status;
  if (input.coverUrl !== undefined) updates.cover_url = input.coverUrl;
  if (input.pdfKey !== undefined) updates.pdf_key = input.pdfKey;

  if (input.authorName) {
    updates.author_id = await ensureAuthor(input.authorName.trim());
  }
  if (input.categoryName) {
    updates.category_id = await ensureCategory(input.categoryName.trim());
  }

  updates.updated_at = new Date().toISOString();

  const { error } = await db.from("books").update(updates).eq("id", input.id);
  if (error) throw error;
  return { success: true };
}

export async function deleteBook(id: number) {
  const db = requireDb();
  const { error } = await db.from("books").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function listAuthors() {
  const db = requireDb();
  const { data, error } = await db.from("authors").select("id,name,bio,created_at").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createAuthor(name: string, bio?: string) {
  const db = requireDb();
  const { data, error } = await db.from("authors").insert({ name: name.trim(), bio: bio?.trim() ?? null }).select("id,name").single();
  if (error) throw error;
  return data;
}


export async function createCategory(name: string, description?: string) {
  const db = requireDb();
  const base = toSlug(name);
  let slug = base;
  let suffix = 2;
  while (await categorySlugExists(slug)) {
    slug = `${base}-${suffix++}`;
  }
  const { data, error } = await db.from("categories").insert({ name: name.trim(), slug, description: description?.trim() ?? null }).select("id,slug,name").single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: number, name: string, description?: string) {
  const db = requireDb();
  const { error } = await db.from("categories").update({ name: name.trim(), description: description?.trim() ?? null }).eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function deleteCategory(id: number) {
  const db = requireDb();
  const { error } = await db.from("categories").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function updateAuthor(id: number, name: string, bio?: string) {
  const db = requireDb();
  const { error } = await db.from("authors").update({ name: name.trim(), bio: bio?.trim() ?? null }).eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function deleteAuthor(id: number) {
  const db = requireDb();
  const { error } = await db.from("authors").delete().eq("id", id);
  if (error) throw error;
  return { success: true };
}

export async function getReadingProgress(userId: string, bookId: number) {
  const db = requireDb();
  const { data, error } = await db
    .from("reading_progress")
    .select("current_page,progress_percentage,updated_at")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  if (error) throw error;
  return data ? { currentPage: data.current_page, progressPercentage: data.progress_percentage, updatedAt: data.updated_at } : null;
}

export async function getUserContinueReading(userId: string): Promise<Array<{
  book: BookRecord;
  currentPage: number;
  progressPercentage: number;
  updatedAt: Date;
}>> {
  const db = requireDb();
  const { data, error } = await db
    .from("reading_progress")
    .select("current_page,progress_percentage,updated_at,books(id,title,slug,description,cover_url,pdf_key,page_count,status,created_at,updated_at,authors(name),categories(name,slug))")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  const results = [];
  for (const row of data ?? []) {
    const rawBook = pick(row.books);
    if (rawBook && rawBook.status === "published") {
      results.push({
        book: toBookRecord(rawBook),
        currentPage: row.current_page,
        progressPercentage: row.progress_percentage,
        updatedAt: new Date(row.updated_at),
      });
    }
  }
  return results;
}

export async function updateReadingProgress(userId: string, bookId: number, currentPage: number, progressPercentage: number) {
  const db = requireDb();
  const { error } = await db
    .from("reading_progress")
    .upsert(
      {
        user_id: userId,
        book_id: bookId,
        current_page: currentPage,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,book_id" },
    );
  if (error) throw error;
}

export async function toggleFavorite(userId: string, bookId: number): Promise<boolean> {
  const db = requireDb();
  const { data: found } = await db
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  if (found) {
    const { error } = await db.from("favorites").delete().eq("id", found.id);
    if (error) throw error;
    return false;
  }
  const { error } = await db.from("favorites").insert({ user_id: userId, book_id: bookId });
  if (error) throw error;
  return true;
}

export async function isFavorite(userId: string, bookId: number): Promise<boolean> {
  const db = requireDb();
  const { data } = await db
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();
  return Boolean(data);
}

export async function getUserFavorites(userId: string): Promise<BookRecord[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("favorites")
    .select("created_at,books(id,title,slug,description,cover_url,pdf_key,page_count,status,created_at,updated_at,authors(name),categories(name,slug))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  const list: BookRecord[] = [];
  for (const row of data ?? []) {
    const rawBook = pick(row.books);
    if (rawBook && rawBook.status === "published") {
      list.push(toBookRecord(rawBook));
    }
  }
  return list;
}

export async function addBookmark(userId: string, bookId: number, pageNumber: number) {
  const db = requireDb();
  const { error } = await db
    .from("bookmarks")
    .upsert(
      { user_id: userId, book_id: bookId, page_number: pageNumber },
      { onConflict: "user_id,book_id,page_number", ignoreDuplicates: true },
    );
  if (error) throw error;
}

export async function getBookmarks(userId: string, bookId: number): Promise<number[]> {
  const db = requireDb();
  const { data, error } = await db
    .from("bookmarks")
    .select("page_number")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("page_number", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((b) => b.page_number);
}

export async function removeBookmark(userId: string, bookId: number, pageNumber: number) {
  const db = requireDb();
  const { error } = await db
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .eq("page_number", pageNumber);
  if (error) throw error;
}

export async function bookSlugExists(slug: string): Promise<boolean> {
  const db = requireDb();
  const { data } = await db.from("books").select("id").eq("slug", slug).maybeSingle();
  return Boolean(data);
}

export type { BookRecord, CategoryRecord };

