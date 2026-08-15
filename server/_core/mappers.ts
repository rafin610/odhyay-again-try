import type { BookRecord, CategoryRecord, User, UserRole } from "../types.js";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole | string;
  last_signed_in: string | Date;
  created_at: string | Date;
  updated_at: string | Date;
};

export function toDate(value: string | Date | null | undefined): Date {
  if (!value) return new Date(0);
  return value instanceof Date ? value : new Date(value);
}

export function toUser(row: UserRow): User {
  const role = row.role === "super_admin" ? "super_admin" : row.role === "admin" ? "admin" : "user";
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role,
    lastSignedIn: toDate(row.last_signed_in),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  created_at: string | Date;
};

export function toCategoryRecord(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    createdAt: toDate(row.created_at),
  };
}

type BookRow = {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_url: string | null;
  pdf_key: string | null;
  page_count: number;
  status: "draft" | "published" | string;
  created_at: string | Date;
  updated_at: string | Date;
  authors?: { name: string } | { name: string }[] | null;
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

function firstOrSelf<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function toBookRecord(row: BookRow): BookRecord {
  const author = firstOrSelf(row.authors);
  const category = firstOrSelf(row.categories);
  const status = row.status === "published" ? "published" : "draft";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    coverUrl: row.cover_url,
    pdfKey: row.pdf_key,
    authorName: author?.name ?? "Unknown",
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    pageCount: row.page_count,
    status,
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}