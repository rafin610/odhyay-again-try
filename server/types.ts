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
