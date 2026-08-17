import React from "react";
import { Link } from "wouter";
import { Heart, Search } from "lucide-react";
import { BookGrid, Mark, PageFrame } from "@/components/OdhyayShell";
import { EmptyState } from "@/components/EmptyState";
import { BookGridSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { Book } from "@/lib/odhyayData";

export function FavoritesPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const favorites = trpc.library.favorites.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const books: Book[] = (favorites.data ?? []).map((b) => ({
    slug: b.slug,
    title: b.title,
    author: b.authorName,
    category: b.categoryName ?? "General",
    pages: b.pageCount || 1,
    cover: b.coverUrl || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=88",
    description: b.description,
  }));

  return (
    <PageFrame>
      <main className="container min-h-[70vh] py-16 lg:py-24">
        <div className="max-w-4xl border-b hairline pb-12">
          <p className="eyebrow text-amethyst">Personal Shelf</p>
          <h1 className="font-display mt-5 text-[clamp(3.2rem,8vw,7rem)] leading-[.92] tracking-[-.03em]">
            Your <span className="text-[#b7a4d7]">favorites.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-[#a9a1ad]">
            Books you have saved to return to again and again.
          </p>
        </div>

        <div className="mt-12">
          {!isAuthenticated && !authLoading ? (
            <EmptyState
              icon={<Heart size={24} />}
              title="Sign in to save favorites"
              description="Keep your favorite books on a personal shelf accessible from any device."
              actionHref="/login?next=/favorites"
              actionLabel="Sign in to Odhyay"
            />
          ) : favorites.isLoading || authLoading ? (
            <BookGridSkeleton count={4} />
          ) : books.length > 0 ? (
            <div>
              <div className="mb-8 flex items-center justify-between">
                <span className="text-xs text-[#8d8594]">
                  {books.length} {books.length === 1 ? "book" : "books"} saved
                </span>
                <Link
                  href="/library"
                  className="focus-ring text-xs font-semibold text-amethyst hover:underline"
                >
                  Browse more books
                </Link>
              </div>
              <BookGrid items={books} />
            </div>
          ) : (
            <EmptyState
              icon={<Heart size={24} />}
              title="Your personal shelf is empty"
              description="Explore the library and tap the heart icon on any book to save it here."
              actionHref="/library"
              actionLabel="Explore the library"
            />
          )}
        </div>
      </main>
    </PageFrame>
  );
}
