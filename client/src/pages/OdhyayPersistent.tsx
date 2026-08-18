/* ODHYAY style: Quiet Editorial — persisted records enter the same calm, literary composition used for the public library. */
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Filter,
  Heart,
  Search,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Logo, BookCard, BookGrid, Mark, PageFrame, SearchBar, SectionLabel } from "@/components/OdhyayShell";
import { PDFReader } from "@/components/PDFReader";
import { EmptyState } from "@/components/EmptyState";
import { BookGridSkeleton, PageHeaderSkeleton } from "@/components/LoadingSkeleton";
import { assets, type Book } from "@/lib/odhyayData";
import { trpc } from "@/lib/trpc";

type RecordBook = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  pdfKey: string | null;
  pageCount: number;
  status: "draft" | "published";
  authorName: string;
  categoryName: string | null;
  categorySlug: string | null;
};

const fallbackCover = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=88";

const toViewBook = (book: RecordBook): Book => ({
  slug: book.slug,
  title: book.title,
  author: book.authorName,
  category: book.categoryName ?? "General",
  pages: book.pageCount || 1,
  cover: book.coverUrl || fallbackCover,
  description: book.description,
});

export function HomePersistentPage() {
  const library = trpc.library.list.useQuery();
  const categories = trpc.library.categories.useQuery();
  const { isAuthenticated } = useAuth();
  const continueReading = trpc.library.continueReading.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const isFav = trpc.reader.isFavorite.useQuery(
    { bookId: 0 },
    { enabled: false }
  );

  const items = (library.data ?? []).map(toViewBook);
  const featured = items[0];
  const continueItem = continueReading.data?.[0];

  return (
    <PageFrame>
      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-16 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />

          <nav className="hidden sm:flex items-center gap-8">
            <Link href="/library" className="text-[#8f8996] transition-colors hover:text-amethyst">
              Library
            </Link>
            <Link href="/categories" className="text-[#8f8996] transition-colors hover:text-amethyst">
              Categories
            </Link>
            <Link href="/favorites" className="text-[#8f8996] transition-colors hover:text-amethyst">
              Favorites
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <SearchBar compact />
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Heart size={16} className="fill-amethyst text-amethyst" />{" "}
                {isFav.data ? "Saved in Favorites" : "Add to Favorites"}
              </div>
            ) : (
              <Link href="/login" className="text-[.72rem] font-semibold uppercase tracking-[.12em] text-[#8f8996] hover:text-amethyst">
                Login
              </Link>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="relative mb-12 overflow-hidden rounded-lg border-b hairline bg-gradient-to-b from-[var(--surface)] to-[var(--background)]">
          <img
            src={assets.hero}
            alt="A quiet reading room"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[var(--background)]/80" />
          <div className="relative container mx-auto max-w-[720px] py-20 flex flex-col sm:flex-row items-start justify-center gap-6">
            <div>
              <p className="eyebrow text-amethyst uppercase tracking-[.15em]">A digital library for curious minds</p>
              <h1 className="font-display mt-4 text-[clamp(2.8rem,7vw,7.5rem)] leading-[.90] tracking-[-.03em] text-[var(--text)]">
                Read.
                <br />
                <span className="text-amethyst">Discover.</span>
                <br />
                Grow.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-[#c1bac5] max-w-lg">
                A calm place to read. Find the next page worth your time, and let the rest of the world go quiet for a while.
              </p>
            </div>
            <div className="hidden sm:block">
              <BookOpen size={48} className="text-amethyst/20" />
            </div>
          </div>
        </section>

        {/* Continue Reading */}
        {isAuthenticated && continueItem && (
          <section className="mb-12 rounded-lg border hairline bg-[var(--elevated)] py-8">
            <div className="container mx-auto max-w-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-14 shrink-0 rounded-sm bg-[var(--border)] overflow-hidden">
                  <img
                    src={continueItem.book.coverUrl || fallbackCover}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-amethyst">
                    <BookOpen size={12} /> Continue Reading
                  </p>
                  <h2 className="font-display mt-1 text-xl leading-none">
                    {continueItem.book.title}
                  </h2>
                  <p className="text-sm text-[#8f8996]">
                    {continueItem.book.authorName} · {continueItem.progressPercentage}% complete
                  </p>
                </div>
              </div>
              <Link
                href={`/read/${continueItem.book.slug}`}
                className="mt-4 w-full rounded-md bg-[var(--accent)] py-3 text-sm font-semibold uppercase tracking-[.14em] text-[var(--background)] transition-colors hover:opacity-90"
              >
                Resume Reading
              </Link>
            </div>
          </section>
        )}

        {/* Featured Book */}
        <section className="mb-12 rounded-lg border hairline bg-[var(--elevated)]">
          <div className="container mx-auto py-8">
            <SectionLabel number="01">Featured book</SectionLabel>
            {library.isLoading ? (
              <div className="min-h-48 rounded-md bg-[var(--border)] animate-pulse" />
            ) : featured ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="rounded-lg overflow-hidden bg-[var(--border)]">
                  <img
                    src={featured.cover}
                    alt={`${featured.title} cover`}
                    className="h-[400px] w-full object-cover"
                  />
                </div>
                <div className="px-6 py-8">
                  <p className="text-xs font-semibold uppercase tracking-[.12em] text-amethyst mb-3">Featured Edition</p>
                  <h2 className="font-display text-[clamp(2.4rem,5vw,3.2rem)] leading-[.93] mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-base text-[#a9a1ad] mb-4">
                    {featured.description}
                  </p>
                  <div className="flex flex-col lg:flex-row gap-2 mb-4">
                    <span className="text-sm text-[#8f8996]">by </span>
                    <span className="font-medium">{featured.author}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[#8f8996]">
                    <span>{featured.pages} pages</span>
                    <span className="h-1 w-1 rounded-full bg-amethyst" />
                    <span>{featured.category}</span>
                  </div>
                  <Link
                    href={`/read/${featured.slug}`}
                    className="mt-4 rounded-md bg-[var(--accent)] py-2.5 text-sm font-semibold uppercase tracking-[.11em] text-[var(--background)] transition-colors"
                  >
                    Start Reading
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Your library is waiting for its first chapter"
                description="No published books exist in the database yet. Sign in as an administrator to add your first book."
                actionHref="/admin/books/new"
                actionLabel="Add a book"
              />
            )}
          </div>
        </section>

        {/* Recently Added */}
        <section className="mb-12 rounded-lg border hairline bg-[var(--elevated)]">
          <div className="container mx-auto py-6">
            <SectionLabel number="02">Recently added</SectionLabel>
            {library.isLoading ? (
              <BookGridSkeleton count={4} />
            ) : items.length ? (
              <BookGrid items={items.slice(0, 8)} />
            ) : (
              <EmptyState
                title="No books published yet"
                description="Check back soon or log into the admin panel to add books to the library."
              />
            )}
            {items.length > 0 && (
              <div className="mt-6 text-center">
                <Link
                  href="/library"
                  className="text-[.76rem] font-semibold uppercase tracking-[.13em] text-amethyst transition-colors hover:text-[var(--accent)]"
                >
                  View all books
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="mb-12 rounded-lg border hairline bg-[var(--elevated)]">
          <div className="container mx-auto py-6">
            <SectionLabel number="03">Find your shelf</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              {(categories.data ?? []).slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  href={`/library?category=${category.slug}`}
                  className="group flex flex-col items-center justify-between border-b hairline px-4 py-3 text-sm font-medium text-[#c9c1ce] transition-colors hover:text-amethyst"
                >
                  <span>{category.name}</span>
                  <span className="text-[.6rem] font-semibold text-[#716a79] group-hover:text-amethyst">
                    {String(category.id).padStart(2, "0")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}
export function LibraryPersistentPage() {
  const urlCategory = new URLSearchParams(window.location.search).get("category");
  const [categorySlug, setCategorySlug] = useState<string | undefined>(urlCategory ?? undefined);
  const categories = trpc.library.categories.useQuery();
  const library = trpc.library.list.useQuery(
    categorySlug ? { categorySlug } : undefined
  );
  const items = (library.data ?? []).map(toViewBook);

  return (
    <PageFrame>
      <main className="container py-16 lg:py-28">
        <div className="flex flex-col justify-between gap-10 border-b hairline pb-14 lg:flex-row lg:items-end lg:gap-24">
          <div className="flex-1">
            <p className="eyebrow text-amethyst">The library / 01</p>
            <h1 className="font-display mt-5 text-[clamp(3.2rem,8vw,7rem)] leading-[.91] tracking-[-.02em]">
              Every book,<br />
              <span className="text-[#81788c]">a doorway.</span>
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[#948c9b]">
            A growing shelf of books selected for their ability to make a little
            more room in your day.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 py-8 sm:gap-4">
          <Filter size={16} className="text-amethyst" />
          <button
            onClick={() => setCategorySlug(undefined)}
            className={`focus-ring transition-all px-3.5 py-2 text-xs font-semibold rounded-xs ${
              !categorySlug
                ? "bg-[#b7a4d7] text-[#17121c]"
                : "text-[#958d9b] hover:text-[#d1c8d5] bg-[#1a171f]"
            }`}
          >
            All books
          </button>
          {(categories.data ?? []).map((category) => (
            <button
              key={category.id}
              onClick={() => setCategorySlug(category.slug)}
              className={`focus-ring transition-all px-3.5 py-2 text-xs font-semibold rounded-xs ${
                categorySlug === category.slug
                  ? "bg-[#b7a4d7] text-[#17121c]"
                  : "text-[#958d9b] hover:text-[#d1c8d5] bg-[#1a171f]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="mb-10 flex items-center justify-between border-t hairline pt-6">
          <span className="text-xs font-medium text-[#837b8b]">
            {items.length} {items.length === 1 ? "book" : "books"} in this view
          </span>
          <Link
            href="/search"
            className="focus-ring flex items-center gap-2 text-xs font-semibold text-[#b7a4d7] transition-colors hover:text-[#cbbbe3]"
          >
            Search the library <Search size={14} />
          </Link>
        </div>

        {library.isLoading ? (
          <BookGridSkeleton count={8} />
        ) : items.length ? (
          <BookGrid items={items} />
        ) : (
          <EmptyState
            title="No books match this category"
            description="Try selecting another category or view all books."
            onAction={() => setCategorySlug(undefined)}
            actionLabel="View all books"
          />
        )}
      </main>
    </PageFrame>
  );
}

export function CategoriesPersistentPage() {
  const categories = trpc.library.categories.useQuery();

  return (
    <PageFrame>
      <main className="container py-16 lg:py-28">
        <div className="max-w-4xl">
          <p className="eyebrow text-amethyst">The library / 02</p>
          <h1 className="font-display mt-5 text-[clamp(3.2rem,8vw,7.2rem)] leading-[.90] tracking-[-.02em]">
            Follow a<br />
            <span className="text-[#81788c]">thread.</span>
          </h1>
          <p className="mt-8 max-w-xl text-[1.05rem] leading-8 text-[#a9a1ad]">
            Some days begin with a story. Some with a question. Choose a
            direction and see where it takes you.
          </p>
        </div>

        {categories.isLoading ? (
          <div className="mt-20 grid border-t hairline sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 border-b hairline p-6 skeleton bg-[#151219]" />
            ))}
          </div>
        ) : (categories.data ?? []).length > 0 ? (
          <div className="mt-20 grid border-t hairline sm:grid-cols-2 lg:grid-cols-3">
            {(categories.data ?? []).map((category, index) => (
              <Link
                key={category.id}
                href={`/library?category=${category.slug}`}
                className="focus-ring group relative min-h-[160px] border-b hairline border-r-0 px-6 py-7 transition-colors hover:bg-[#1a161f] sm:border-r sm:last-child:border-r-0 sm:even:border-r-0 lg:border-r"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <Mark small />
                    <span className="text-[.7rem] font-semibold text-[#6f6876] transition-colors group-hover:text-[#a798ad]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-end justify-between gap-3 mt-8">
                    <div>
                      <h2 className="font-display text-[1.65rem] leading-tight transition-colors group-hover:text-amethyst">
                        {category.name}
                      </h2>
                      {category.description && (
                        <p className="mt-1 text-xs text-[#8f8996] line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} className="shrink-0 text-[#6f6876] transition-colors group-hover:text-amethyst" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-12">
            <EmptyState
              title="No categories defined yet"
              description="Categories will appear automatically when books are categorized by authors or admins."
            />
          </div>
        )}
      </main>
    </PageFrame>
  );
}

export function SearchPersistentPage() {
  const initial = new URLSearchParams(window.location.search).get("q") ?? "";
  const [query, setQuery] = useState(initial);
  const [debouncedQuery, setDebouncedQuery] = useState(initial);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const library = trpc.library.list.useQuery(
    debouncedQuery ? { query: debouncedQuery } : undefined
  );
  const items = (library.data ?? []).map(toViewBook);

  return (
    <PageFrame>
      <main className="container min-h-[720px] py-16 lg:py-28">
        <div className="max-w-4xl">
          <p className="eyebrow text-amethyst">Search the shelves</p>
          <h1 className="font-display mt-5 text-[clamp(3.2rem,8vw,7rem)] leading-[.91] tracking-[-.02em]">
            What are you<br />
            <span className="text-[#81788c]">looking for?</span>
          </h1>
          <div className="mt-10 w-full max-w-[620px]">
            <SearchBar compact defaultValue={query} onChange={setQuery} />
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-16 border-t hairline pt-8">
          <div className="mb-10 flex items-center justify-between">
            <span className="text-xs font-medium text-[#8d8594]">
              {debouncedQuery
                ? `${items.length} ${items.length === 1 ? "result" : "results"} for "${debouncedQuery}"`
                : `Showing all ${items.length} books`}
            </span>
            {debouncedQuery && (
              <button
                onClick={() => {
                  setQuery("");
                  setDebouncedQuery("");
                }}
                className="focus-ring text-xs font-semibold text-amethyst transition-colors hover:underline"
              >
                Clear search
              </button>
            )}
          </div>

          {library.isLoading ? (
            <BookGridSkeleton count={8} />
          ) : items.length ? (
            <BookGrid items={items} />
          ) : (
            <EmptyState
              icon={<Search size={24} />}
              title={`No books found for "${debouncedQuery}"`}
              description="Try searching with a different title, author, or subject."
              onAction={() => {
                setQuery("");
                setDebouncedQuery("");
              }}
              actionLabel="View all books"
            />
          )}
        </div>
      </main>
    </PageFrame>
  );
}

export function BookPersistentPage() {
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
                className={`focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] transition-colors ${
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
export function ReaderPersistentPage() {
  const [, params] = useRoute("/read/:slug");
  const slug = params?.slug;
  const detail = trpc.library.getBySlug.useQuery(
    { slug: slug ?? "route-pending" },
    { enabled: Boolean(slug) }
  );
  const { isAuthenticated } = useAuth();
  const book = detail.data as RecordBook | undefined;

  const savedProgress = trpc.reader.getProgress.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && isAuthenticated) }
  );

  const saveProgress = trpc.reader.saveProgress.useMutation();
  const saveBookmark = trpc.reader.addBookmark.useMutation({
    onSuccess: () => toast.success("Bookmark saved."),
    onError: () => toast.error("Please sign in to save bookmarks."),
  });

  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState(
    "system"
  );

  // System theme detection
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem("odhyay-reader-theme", theme);
  }, [theme]);

  // Restore page position on load
  useEffect(() => {
    if (savedProgress.data?.currentPage) {
      setPage(savedProgress.data.currentPage);
    }
  }, [savedProgress.data?.currentPage]);

  const pdf = trpc.reader.pdfUrl.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && book.pdfKey && isAuthenticated) }
  );

  // Save reading progress (debounced)
  useEffect(() => {
    if (book && isAuthenticated && page > 0) {
      const timer = setTimeout(() => {
        saveProgress.mutate({
          bookId: book.id,
          currentPage: page,
          progressPercentage: Math.round((page / Math.max(1, book.pageCount)) * 100),
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [page, book?.id, isAuthenticated]);

  if (!slug || !book) {
    return (
      <PageFrame>
        <main className="container py-24">
          <EmptyState
            title="Reading room unavailable"
            description="The requested book could not be loaded."
            actionHref="/library"
            actionLabel="Return to library"
          />
        </main>
      </PageFrame>
    );
  }

  const pages = Math.max(1, book.pageCount);

  return (
    <PDFReader
      book={{
        id: book.id,
        slug: book.slug,
        title: book.title,
        categoryName: book.categoryName,
        authorName: book.authorName,
        pageCount: book.pageCount,
      }}
      page={page}
      pages={pages}
      zoom={zoom}
      theme={theme}
      onPageChange={setPage}
      onZoomChange={setZoom}
      onThemeChange={setTheme}
      onBookmark={() =>
        saveBookmark.mutate({ bookId: book.id, pageNumber: page })
      }
      showDownload={false}
      showPrint={false}
      pdfUrl={pdf.data?.url}
      isLoadingPdf={pdf.isLoading}
    />
  );
}
