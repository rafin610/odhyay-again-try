import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { getSupabase } from "./_core/supabase.js";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import {
  addBookmark,
  createAuthor,
  createBook,
  createCategory,
  deleteAuthor,
  deleteBook,
  deleteCategory,
  getBookBySlug,
  getBookmarks,
  getReadingProgress,
  getUserContinueReading,
  getUserFavorites,
  isFavorite,
  listAuthors,
  listBooks,
  listCategories,
  removeBookmark,
  toggleFavorite,
  updateAuthor,
  updateBook,
  updateCategory,
  updateReadingProgress,
} from "./db.js";

const bookInput = z.object({
  title: z.string().trim().min(1).max(400),
  authorName: z.string().trim().min(1).max(240),
  categoryName: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(10_000),
  pageCount: z.number().int().min(0).max(20_000).optional(),
  status: z.enum(["draft", "published"]),
  coverUrl: z.string().url().optional().nullable(),
  pdfKey: z.string().max(512).optional().nullable(),
});

const updateBookInput = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(400).optional(),
  authorName: z.string().trim().min(1).max(240).optional(),
  categoryName: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().min(1).max(10_000).optional(),
  pageCount: z.number().int().min(0).max(20_000).optional(),
  status: z.enum(["draft", "published"]).optional(),
  coverUrl: z.string().url().optional().nullable(),
  pdfKey: z.string().max(512).optional().nullable(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  library: router({
    list: publicProcedure
      .input(
        z
          .object({
            query: z.string().trim().max(160).optional(),
            categorySlug: z.string().trim().max(180).optional(),
          })
          .optional(),
      )
      .query(async ({ input }) => listBooks(input)),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string().min(1).max(460) }))
      .query(async ({ input }) => getBookBySlug(input.slug)),
    categories: publicProcedure.query(() => listCategories()),
    continueReading: protectedProcedure.query(({ ctx }) => getUserContinueReading(ctx.user.id)),
    favorites: protectedProcedure.query(({ ctx }) => getUserFavorites(ctx.user.id)),
  }),
  reader: router({
    pdfUrl: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive() }))
      .query(async ({ input }) => {
        const { data: book, error: bookError } = await getSupabase()
          .from("books")
          .select("pdf_key,status")
          .eq("id", input.bookId)
          .maybeSingle();
        if (bookError) throw bookError;
        if (!book || book.status !== "published" || !book.pdf_key) {
          throw new TRPCError({ code: "NOT_FOUND", message: "This book has no readable PDF." });
        }
        const { data, error } = await getSupabase().storage.from("books").createSignedUrl(book.pdf_key, 300);
        if (error) throw error;
        return { url: data.signedUrl, expiresIn: 300 };
      }),
    getProgress: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => getReadingProgress(ctx.user.id, input.bookId)),
    saveProgress: protectedProcedure
      .input(
        z.object({
          bookId: z.number().int().positive(),
          currentPage: z.number().int().positive(),
          progressPercentage: z.number().int().min(0).max(100),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        await updateReadingProgress(ctx.user.id, input.bookId, input.currentPage, input.progressPercentage);
        return { success: true } as const;
      }),
    toggleFavorite: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => ({ favorite: await toggleFavorite(ctx.user.id, input.bookId) })),
    isFavorite: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => isFavorite(ctx.user.id, input.bookId)),
    addBookmark: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive(), pageNumber: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addBookmark(ctx.user.id, input.bookId, input.pageNumber);
        return { success: true } as const;
      }),
    getBookmarks: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => getBookmarks(ctx.user.id, input.bookId)),
    removeBookmark: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive(), pageNumber: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await removeBookmark(ctx.user.id, input.bookId, input.pageNumber);
        return { success: true } as const;
      }),
  }),
  admin: router({
    listBooks: adminProcedure.query(() => listBooks({ includeDrafts: true })),
    createBook: adminProcedure.input(bookInput).mutation(async ({ input }) => createBook(input as any)),
    updateBook: adminProcedure.input(updateBookInput).mutation(async ({ input }) => updateBook(input as any)),
    deleteBook: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => deleteBook(input.id)),

    listCategories: adminProcedure.query(() => listCategories()),
    createCategory: adminProcedure
      .input(z.object({ name: z.string().trim().min(1).max(160), description: z.string().trim().optional() }))
      .mutation(async ({ input }) => createCategory(input.name, input.description)),
    updateCategory: adminProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(1).max(160), description: z.string().trim().optional() }))
      .mutation(async ({ input }) => updateCategory(input.id, input.name, input.description)),
    deleteCategory: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => deleteCategory(input.id)),

    listAuthors: adminProcedure.query(() => listAuthors()),
    createAuthor: adminProcedure
      .input(z.object({ name: z.string().trim().min(1).max(240), bio: z.string().trim().optional() }))
      .mutation(async ({ input }) => createAuthor(input.name, input.bio)),
    updateAuthor: adminProcedure
      .input(z.object({ id: z.number().int().positive(), name: z.string().trim().min(1).max(240), bio: z.string().trim().optional() }))
      .mutation(async ({ input }) => updateAuthor(input.id, input.name, input.bio)),
    deleteAuthor: adminProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input }) => deleteAuthor(input.id)),


    createUploadUrl: adminProcedure
      .input(
        z.object({
          bucket: z.enum(["covers", "books"]),
          extension: z.enum(["png", "jpg", "jpeg", "webp", "pdf"]),
        }),
      )
      .mutation(async ({ input }) => {
        const path = `${input.bucket}/${crypto.randomUUID()}.${input.extension}`;
        const { data, error } = await getSupabase().storage.from(input.bucket).createSignedUploadUrl(path);
        if (error) throw error;
        return { bucket: input.bucket, path, token: data.token };
      }),
  }),
});

export type AppRouter = typeof appRouter;