import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { getSupabase } from "./_core/supabase.js";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc.js";
import {
  addBookmark,
  createBook,
  getBookBySlug,
  listBooks,
  listCategories,
  toggleFavorite,
  updateReadingProgress,
} from "./db.js";

const bookInput = z.object({
  title: z.string().trim().min(1).max(400),
  authorName: z.string().trim().min(1).max(240),
  categoryName: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(10_000),
  pageCount: z.number().int().min(0).max(20_000).optional(),
  status: z.enum(["draft", "published"]),
  coverUrl: z.string().url().optional(),
  pdfKey: z.string().max(512).optional(),
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
        const { data, error } = await getSupabase().storage.from("books").createSignedUrl(book.pdf_key, 3600);
        if (error) throw error;
        return { url: data.signedUrl, expiresIn: 3600 };
      }),
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
    addBookmark: protectedProcedure
      .input(z.object({ bookId: z.number().int().positive(), pageNumber: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await addBookmark(ctx.user.id, input.bookId, input.pageNumber);
        return { success: true } as const;
      }),
  }),
  admin: router({
    listBooks: adminProcedure.query(() => listBooks({ includeDrafts: true })),
    createBook: adminProcedure.input(bookInput).mutation(async ({ input }) => createBook(input)),
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