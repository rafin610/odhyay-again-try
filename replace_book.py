#!/usr/bin/env python3
import sys

filepath = r"D:\Download\prompt-website (3)\client\src\pages\OdhyayPersistent.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find BookPersistentPage
old_marker = "export function BookPersistentPage() {"
pos = content.find(old_marker)
if pos == -1:
    print("ERROR: Could not find BookPersistentPage marker")
    sys.exit(1)

# Find next function (ReaderPersistentPage)
next_pos = content.find("export function ReaderPersistentPage", pos)
if next_pos == -1:
    next_pos = len(content)

# New BookPersistentPage content
new_block = """export function BookPersistentPage() {
  const [, params] = useRoute("/book/:slug");
  const slug = params?.slug;
  const detail = trpc.library.getBySlug.useQuery(
    { slug: slug ?? "route-pending" },
    { enabled: Boolean(slug) }
  );
  const book = detail.data as RecordBook | undefined;
  const { isAuthenticated } = useAuth();

  const isFav = trpc.reader.isFavorite.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && isAuthenticated) }
  );

  const savedProgress = trpc.reader.getProgress.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && isAuthenticated) }
  );

  const savedBookmarks = trpc.reader.getBookmarks.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && isAuthenticated) }
  );

  const favorite = trpc.reader.toggleFavorite.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.favorite ? "Added to favorites." : "Removed from favorites."
      );
      void isFav.refetch();
    },
    onError: () => toast.error("Please sign in to manage favorites.")
  });

  if (!slug || detail.isLoading) {
    return (
      <PageFrame>
        <main className="container py-24">
          <PageHeaderSkeleton />
        </main>
      </PageFrame>
    );
  }

  if (!book) {
    return (
      <PageFrame>
        <main className="container py-24">
          <EmptyState
            title="Book not found"
            description="This book doesn't exist or may have been removed."
            actionHref="/library"
            actionLabel="Return to library"
          />
        </main>
      </PageFrame>
    );
  }

  const view = toViewBook(book);
  const currentPage = savedProgress.data?.currentPage;

  return (
    <PageFrame>
      <main className="container mx-auto py-16 lg:py-24">
        <Link
          href="/library"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996] transition-colors hover:text-amethyst"
        >
          <ArrowLeft size={15} /> Back to library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(280px,420px)_1fr] lg:gap-20">
          {/* Book Cover */}
          <div className="mx-auto w-full max-w-[360px] lg:mx-0">
            <div className="aspect-[2/3] overflow-hidden bg-[var(--border)] cover-shadow rounded-sm">
              <img
                src={view.cover}
                alt={`${view.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="px-6 py-8">
            <p className="eyebrow text-amethyst">
              {view.category} · {view.pages} pages
            </p>
            <h1 className="font-display text-[clamp(2.4rem,5vw,3.6rem)] leading-[.93] tracking-[-.01em]">
              {view.title}
            </h1>
            <p className="mt-3 text-lg font-medium text-[#a9a1ad]">
              {view.author}
            </p>
            <p className="mt-6 text-[1.05rem] leading-8 text-[#b7afbb]">
              {view.description}
            </p>

            {/* Reading Progress Indicator if any */}
            {currentPage && currentPage > 1 && (
              <div className="mt-6 flex items-center gap-3 rounded-sm border hairline bg-[var(--background)] px-5 py-4 text-xs">
                <BookOpen size={14} className="text-amethyst shrink-0" />
                <div>
                  <p className="font-semibold text-[#f3eee6]">
                    You were reading Page {currentPage} of {view.pages}
                  </p>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--border)] overflow-hidden">
                    <div
                      className="h-full bg-amethyst"
                      style={{ width: `${Math.round((currentPage / view.pages) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Link
                href={`/read/${view.slug}`}
                className="focus-ring btn-primary"
              >
                {currentPage && currentPage > 1
                  ? `Continue Page ${currentPage}`
                  : "Start Reading"}{" "}
                <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => favorite.mutate({ bookId: book.id })}
                className={`focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] transition-colors ${{
                  isFav.data ? "text-amethyst" : "text-[var(--mutedText)] hover:text-amethyst"
                }`}
              >
                <Heart
                  size={16}
                  className={isFav.data ? "fill-amethyst text-amethyst" : ""}
                />{" "}
                {isFav.data ? "Saved in Favorites" : "Add to Favorites"}
              </button>
            </div>

            {/* Bookmarks list if any */}
            {savedBookmarks.data && savedBookmarks.data.length > 0 && (
              <div className="mt-10 border-t hairline pt-6">
                <p className="eyebrow text-[#8f8996] mb-3">Your Bookmarks</p>
                <div className="flex flex-wrap gap-2">
                  {savedBookmarks.data.map((pageNum) => (
                    <Link
                      key={pageNum}
                      href={`/read/${view.slug}`}
                      className="focus-ring inline-flex items-center gap-1.5 bg-[var(--background)] px-3 py-1.5 text-xs text-[var(--mutedText)] hover:text-amethyst border hairline rounded-xs"
                    >
                      <Bookmark size={12} className="text-amethyst" />
                      Page {pageNum}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageFrame>
  );
}
"""

# Replace
new_content = content[:pos] + new_block + content[next_pos:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("BookPersistentPage replaced successfully")