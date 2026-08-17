export type UserRole = "user" | "admin" | "super_admin";

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  lastSignedIn: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type BookStatus = "draft" | "published";

export type BookRecord = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  pdfKey: string | null;
  authorName: string;
  categoryName: string | null;
  categorySlug: string | null;
  pageCount: number;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryRecord = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
};

export type CreateBookInput = {
  title: string;
  authorName: string;
  categoryName: string;
  description: string;
  pageCount?: number;
  status: BookStatus;
  coverUrl?: string;
  pdfKey?: string;
};

export type UpdateBookInput = {
  id: number;
  title?: string;
  authorName?: string;
  categoryName?: string;
  description?: string;
  pageCount?: number;
  status?: BookStatus;
  coverUrl?: string | null;
  pdfKey?: string | null;
};

export type AuthorRecord = {
  id: number;
  name: string;
  bio: string | null;
  createdAt: Date;
  bookCount?: number;
};

export type ReadingProgressRecord = {
  id: number;
  userId: string;
  bookId: number;
  currentPage: number;
  progressPercentage: number;
  updatedAt: Date;
};

export type BookmarkRecord = {
  id: number;
  userId: string;
  bookId: number;
  pageNumber: number;
  createdAt: Date;
};

