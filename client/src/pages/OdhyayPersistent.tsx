/* ODHYAY style: Quiet Editorial — persisted records enter the same calm, literary composition used for the public library. */
import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronRight,
  Expand,
  Filter,
  Heart,
  Minus,
  Plus,
  Search,
  Sparkles,
  Upload,
  Check,
  FileText,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { BookGrid, Mark, PageFrame, SearchBar, SectionLabel } from "@/components/OdhyayShell";
import { PDFReader } from "@/components/PDFReader";
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

const fallbackCover = assets.cover1;
const toViewBook = (book: RecordBook): Book => ({
  slug: book.slug,
  title: book.title,
  author: book.authorName,
  category: book.categoryName ?? "Other",
  pages: book.pageCount || 1,
  cover: book.coverUrl || fallbackCover,
  description: book.description,
});

function QueryNotice({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: unknown;
  empty: string;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-[2/3] bg-[#2a2430]" />
              <div className="skeleton h-5 w-3/4 bg-[#2a2430]" />
              <div className="skeleton h-3 w-1/2 bg-[#2a2430]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-sm border border-[#5c3a48] bg-[#25171f] px-8 py-12">
        <div className="text-center">
          <p className="text-sm text-[#d7b7c2] font-medium">
            Something went wrong
          </p>
          <p className="mt-2 text-xs text-[#a68fa0]">
            We couldn't load this content. Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-dashed border-[#4a4052] bg-[#151219] px-8 py-16 text-center">
      <Mark />
      <h2 className="font-display mt-6 text-2xl text-[#f3eee6]">{empty}</h2>
      <p className="mt-3 text-sm text-[#8f8996]">
        Your first published book will appear here.
      </p>
    </div>
  );
}

export function HomePersistentPage() {
  const library = trpc.library.list.useQuery();
  const categories = trpc.library.categories.useQuery();
  const items = (library.data ?? []).map(toViewBook);
  const featured = items[0];

  return (
    <PageFrame>
      <main>
        {/* Hero Section */}
        <section className="relative min-h-[740px] overflow-hidden border-b hairline sm:min-h-[680px] lg:min-h-[720px]">
          <img
            src={assets.hero}
            alt="A quiet reading room"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="hero-vignette absolute inset-0" />
          <div className="relative container flex min-h-[740px] flex-col items-start justify-center py-24 sm:min-h-[680px] lg:min-h-[720px]">
            <div className="w-full max-w-[720px]">
              <p className="eyebrow text-amethyst">
                A digital library for curious minds
              </p>
              <h1 className="font-display mt-8 text-[clamp(2.8rem,8vw,8rem)] leading-[.89] tracking-[-.03em]">
                Read.
                <br />
                <span className="text-[#b7a4d7]">Discover.</span>
                <br />
                Grow.
              </h1>
              <p className="mt-10 max-w-lg text-[1.05rem] leading-8 text-[#c1bac5]">
                A calm place to read. Find the next page worth your time, and let
                the rest of the world go quiet for a while.
              </p>

              {/* Action Buttons */}
              <div className="mt-12 flex flex-wrap items-center gap-4 sm:gap-5">
                <Link
                  href="/library"
                  className="btn-primary focus-ring"
                >
                  Explore Library <ArrowRight size={16} />
                </Link>
                <Link
                  href="/categories"
                  className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-[#d1c8d5] transition-colors hover:text-amethyst"
                >
                  Browse Categories <ChevronRight size={16} />
                </Link>
              </div>

              {/* Search Section - Enhanced Prominence */}
              <div className="mt-16 w-full max-w-[620px]">
                <p className="mb-4 text-[.75rem] font-semibold uppercase tracking-[.16em] text-[#8f8996]">
                  Search the library
                </p>
                <SearchBar />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Book Section */}
        <section className="container py-28 lg:py-40">
          <SectionLabel number="01">Featured book</SectionLabel>
          {featured ? (
            <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_1.3fr] lg:items-center lg:gap-32">
              <Link
                href={`/book/${featured.slug}`}
                className="focus-ring reveal group relative mx-auto block w-full max-w-[360px] lg:max-w-none"
              >
                <div className="aspect-[2/3] overflow-hidden bg-[#25212b] cover-shadow">
                  <img
                    src={featured.cover}
                    alt={`${featured.title} cover`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
              <div className="max-w-[650px] reveal reveal-delay-1">
                <p className="eyebrow text-[#8f8996]">
                  Editor's shelf · {featured.pages} pages
                </p>
                <h2 className="font-display mt-7 text-[clamp(2.8rem,6vw,5.6rem)] leading-[.93] tracking-[-.02em]">
                  {featured.title}
                </h2>
                <p className="mt-7 text-[1rem] leading-8 text-[#b5adb8]">
                  {featured.description}
                </p>
                <div className="mt-10 flex items-center gap-5 text-xs text-[#8f8996]">
                  <span className="font-medium">{featured.author}</span>
                  <span className="h-1 w-1 rounded-full bg-[#b7a4d7]" />
                  <span className="font-medium">{featured.category}</span>
                </div>
                <div className="mt-12 flex flex-wrap gap-5">
                  <Link
                    href={`/read/${featured.slug}`}
                    className="focus-ring inline-flex items-center gap-3 bg-[#b7a4d7] px-6 py-3 text-xs font-bold uppercase tracking-[.15em] text-[#17121c] transition-all hover:bg-[#cbbbe3]"
                  >
                    Read now <ArrowRight size={16} />
                  </Link>
                  <Link
                    href={`/book/${featured.slug}`}
                    className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996] transition-colors hover:text-amethyst"
                  >
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <QueryNotice
              loading={library.isLoading}
              error={library.error}
              empty="Your library is waiting for its first chapter."
            />
          )}
        </section>

        {/* Recently Added Section */}
        <section className="border-y hairline bg-[#151219] py-28 lg:py-40">
          <div className="container">
            <SectionLabel number="02">Recently added</SectionLabel>
            {items.length ? (
              <BookGrid items={items.slice(0, 8)} />
            ) : (
              <QueryNotice
                loading={library.isLoading}
                error={library.error}
                empty="No books have been published yet."
              />
            )}
            {items.length > 0 && (
              <div className="mt-16 flex justify-center">
                <Link
                  href="/library"
                  className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.15em] text-[#b7a4d7] transition-colors hover:text-[#cbbbe3]"
                >
                  View all books <ArrowRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Browse by Category Section */}
        <section className="container py-28 lg:py-40">
          <div className="grid gap-20 lg:grid-cols-[1fr_2.2fr] lg:gap-32">
            <div className="flex flex-col justify-center">
              <SectionLabel number="03">Find your shelf</SectionLabel>
              <h2 className="font-display text-[clamp(2.6rem,5vw,5rem)] leading-[.95] tracking-[-.01em]">
                Read by<br />
                <span className="text-amethyst">curiosity.</span>
              </h2>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#8f8996]">
                Explore our collection organized by subject, theme, and interest. Find your next favorite book.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t hairline sm:grid-cols-3">
              {(categories.data ?? []).slice(0, 9).map((category, index) => (
                <Link
                  href={`/search?q=${encodeURIComponent(category.name)}`}
                  key={category.id}
                  className="focus-ring group flex min-h-[110px] items-center justify-between border-b hairline px-3 py-6 text-sm font-medium text-[#c9c1ce] transition-colors hover:text-amethyst sm:px-5"
                >
                  <span>{category.name}</span>
                  <span className="text-[.65rem] font-semibold text-[#716a79] group-hover:text-[#b7a4d7]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}
              {!categories.isLoading && !categories.data?.length && (
                <p className="col-span-full py-12 text-sm text-[#8f8996]">
                  Categories will appear as books are added.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>
    </PageFrame>
  );
}

export function LibraryPersistentPage() {
  const [categorySlug, setCategorySlug] = useState<string>();
  const categories = trpc.library.categories.useQuery();
  const library = trpc.library.list.useQuery(
    categorySlug ? { categorySlug } : undefined
  );
  const items = (library.data ?? []).map(toViewBook);

  return (
    <PageFrame>
      <main className="container py-20 lg:py-32">
        <div className="flex flex-col justify-between gap-12 border-b hairline pb-16 lg:flex-row lg:items-end lg:gap-24">
          <div className="flex-1">
            <p className="eyebrow text-amethyst">The library / 01</p>
            <h1 className="font-display mt-6 text-[clamp(3.2rem,8vw,7.2rem)] leading-[.91] tracking-[-.02em]">
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
        <div className="flex flex-wrap items-center gap-3 py-10 sm:gap-4">
          <Filter size={16} className="text-amethyst" />
          <button
            onClick={() => setCategorySlug(undefined)}
            className={`focus-ring transition-all px-3 py-2 text-xs font-semibold ${
              !categorySlug
                ? "bg-[#b7a4d7] text-[#17121c]"
                : "text-[#958d9b] hover:text-[#d1c8d5]"
            }`}
          >
            All books
          </button>
          {(categories.data ?? []).slice(0, 6).map((category) => (
            <button
              key={category.id}
              onClick={() => setCategorySlug(category.slug)}
              className={`focus-ring transition-all px-3 py-2 text-xs font-semibold ${
                categorySlug === category.slug
                  ? "bg-[#b7a4d7] text-[#17121c]"
                  : "text-[#958d9b] hover:text-[#d1c8d5]"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="mb-12 flex items-center justify-between border-t hairline pt-7">
          <span className="text-xs font-medium text-[#837b8b]">
            {items.length} {items.length === 1 ? "book" : "books"} in the collection
          </span>
          <Link
            href="/search"
            className="focus-ring flex items-center gap-2 text-xs font-semibold text-[#b7a4d7] transition-colors hover:text-[#cbbbe3]"
          >
            Search the library <Search size={14} />
          </Link>
        </div>

        {items.length ? (
          <BookGrid items={items} />
        ) : (
          <QueryNotice
            loading={library.isLoading}
            error={library.error}
            empty="Your library is waiting for its first chapter."
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
      <main className="container py-20 lg:py-32">
        <div className="max-w-4xl">
          <p className="eyebrow text-amethyst">The library / 02</p>
          <h1 className="font-display mt-6 text-[clamp(3.2rem,8vw,7.4rem)] leading-[.90] tracking-[-.02em]">
            Follow a<br />
            <span className="text-[#81788c]">thread.</span>
          </h1>
          <p className="mt-10 max-w-xl text-[1.05rem] leading-8 text-[#a9a1ad]">
            Some days begin with a story. Some with a question. Choose a
            direction and see where it takes you.
          </p>
        </div>

        <div className="mt-24 grid border-t hairline sm:grid-cols-2 lg:grid-cols-3 lg:gap-px">
          {(categories.data ?? []).map((category, index) => (
            <Link
              key={category.id}
              href={`/search?q=${encodeURIComponent(category.name)}`}
              className="focus-ring group relative min-h-[180px] border-b hairline border-r-0 px-6 py-7 transition-colors hover:bg-[#1a161f] sm:border-r sm:last-child:border-r-0 sm:even:border-r-0 lg:border-r"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <Mark small />
                  <span className="text-[.7rem] font-semibold text-[#6f6876] transition-colors group-hover:text-[#a798ad]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3">
                  <h2 className="font-display text-[1.75rem] leading-tight transition-colors group-hover:text-amethyst">
                    {category.name}
                  </h2>
                  <ChevronRight size={18} className="shrink-0 text-[#6f6876] transition-colors group-hover:text-amethyst" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!categories.isLoading && !categories.data?.length && (
          <div className="mt-12">
            <QueryNotice
              loading={false}
              error={categories.error}
              empty="The first category is still waiting."
            />
          </div>
        )}
      </main>
    </PageFrame>
  );
}

export function SearchPersistentPage() {
  const initial = new URLSearchParams(window.location.search).get("q") ?? "";
  const library = trpc.library.list.useQuery(
    initial ? { query: initial } : undefined
  );
  const items = (library.data ?? []).map(toViewBook);

  return (
    <PageFrame>
      <main className="container min-h-[720px] py-20 lg:py-32">
        <div className="max-w-4xl">
          <p className="eyebrow text-amethyst">Search the shelves</p>
          <h1 className="font-display mt-6 text-[clamp(3.2rem,8vw,7.2rem)] leading-[.91] tracking-[-.02em]">
            What are you<br />
            <span className="text-[#81788c]">looking for?</span>
          </h1>
          <div className="mt-12 w-full max-w-[620px]">
            <SearchBar compact defaultValue={initial} />
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-20 border-t hairline pt-10">
          <div className="mb-12 flex items-center justify-between">
            <span className="text-xs font-medium text-[#8d8594]">
              {initial
                ? `${items.length} ${items.length === 1 ? "result" : "results"} for "${initial}"`
                : "Showing all books"}
            </span>
            {initial && (
              <Link
                href="/search"
                className="focus-ring text-xs font-semibold text-[#b7a4d7] transition-colors hover:text-[#cbbbe3]"
              >
                Clear search
              </Link>
            )}
          </div>
          {items.length ? (
            <BookGrid items={items} />
          ) : (
            <QueryNotice
              loading={library.isLoading}
              error={library.error}
              empty="No books found."
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
  const favorite = trpc.reader.toggleFavorite.useMutation({
    onSuccess: (result) =>
      toast.success(
        result.favorite ? "Added to favorites." : "Removed from favorites."
      ),
    onError: () => toast.error("Please sign in to manage favorites."),
  });

  if (!slug || detail.isLoading)
    return (
      <PageFrame>
        <main className="container py-24">
          <QueryNotice loading error={null} empty="" />
        </main>
      </PageFrame>
    );

  if (!book)
    return (
      <PageFrame>
        <main className="container py-24">
          <QueryNotice
            loading={false}
            error={detail.error}
            empty="This book is not available."
          />
        </main>
      </PageFrame>
    );

  const view = toViewBook(book);

  return (
    <PageFrame>
      <main className="container py-16 lg:py-24">
        <Link
          href="/library"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996] transition-colors hover:text-[#c1bac5]"
        >
          <ArrowLeft size={15} /> Back to library
        </Link>

        <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(300px,460px)_1fr] lg:items-center lg:gap-32">
          {/* Book Cover */}
          <div className="mx-auto w-full max-w-[420px] lg:mx-0">
            <div className="aspect-[2/3] overflow-hidden bg-[#24202a] cover-shadow">
              <img
                src={view.cover}
                alt={`${view.title} cover`}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Book Details */}
          <div className="max-w-3xl">
            <p className="eyebrow text-amethyst">
              {view.category} · {view.pages} pages
            </p>
            <h1 className="font-display mt-8 text-[clamp(2.8rem,7vw,6.8rem)] leading-[.91] tracking-[-.02em]">
              {view.title}
            </h1>
            <p className="mt-8 text-lg font-medium text-[#a9a1ad]">
              {view.author}
            </p>
            <div className="my-10 h-px w-full bg-[#332d39]" />
            <p className="max-w-2xl text-[1.05rem] leading-8 text-[#b7afbb]">
              {view.description}
            </p>

            {/* Action Buttons */}
            <div className="mt-14 flex flex-wrap gap-6">
              <Link
                href={`/read/${view.slug}`}
                className="focus-ring btn-primary"
              >
                Read now <ArrowRight size={16} />
              </Link>
              <button
                onClick={() => favorite.mutate({ bookId: book.id })}
                className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#d1c8d5] transition-colors hover:text-amethyst"
              >
                <Heart size={16} /> Add to favorites
              </button>
            </div>
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
  const saveProgress = trpc.reader.saveProgress.useMutation();
  const saveBookmark = trpc.reader.addBookmark.useMutation({
    onSuccess: () => toast.success("Bookmark saved."),
    onError: () => toast.error("Please sign in to save bookmarks."),
  });

  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [theme, setTheme] = useState(
    () => localStorage.getItem("odhyay-reader-theme") || "dark"
  );

  const book = detail.data as RecordBook | undefined;
  const pdf = trpc.reader.pdfUrl.useQuery(
    { bookId: book?.id ?? 0 },
    { enabled: Boolean(book?.id && book.pdfKey && isAuthenticated) }
  );

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("odhyay-reader-theme", theme);
  }, [theme]);

  // Auto-save reading progress
  useEffect(() => {
    if (book && isAuthenticated) {
      saveProgress.mutate({
        bookId: book.id,
        currentPage: page,
        progressPercentage: Math.round((page / Math.max(1, book.pageCount)) * 100),
      });
    }
  }, [page, book, isAuthenticated, saveProgress]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const pages = Math.max(1, book?.pageCount ?? 1);
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setPage((p) => Math.min(pages, p + 1));
      } else if (e.key === "+") {
        e.preventDefault();
        setZoom((z) => Math.min(1.5, z + 0.1));
      } else if (e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(0.8, z - 0.1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [book?.pageCount]);

  if (!slug || !book) {
    return (
      <PageFrame>
        <main className="container py-24">
          <QueryNotice
            loading={detail.isLoading}
            error={detail.error}
            empty="This reading room is not available."
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
      pdfUrl={pdf.data?.url}
      isLoadingPdf={pdf.isLoading}
    />
  );
}

// Admin Pages
function AdminSidebar({ active }: { active: string }) {
  const links = [
    { href: "/admin", label: "Overview", icon: Search },
    { href: "/admin/books", label: "Books", icon: FileText },
    { href: "/categories", label: "Categories", icon: Filter },
  ];

  return (
    <aside className="hidden w-72 shrink-0 border-r hairline bg-[#151219] p-8 lg:flex lg:flex-col">
      <Link href="/" className="focus-ring flex items-center gap-3">
        <Mark />
        <span className="font-display text-[1.35rem] tracking-[.18em]">
          ODHYAY
        </span>
      </Link>
      <p className="eyebrow mt-16 text-[#8f8996]">Workspace</p>
      <nav className="mt-6 flex flex-col gap-2">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`focus-ring flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              active === label
                ? "rounded-sm bg-[#2c2534] text-amethyst shadow-md"
                : "text-[#a19aaa] hover:text-[#f3eee6] hover:bg-[#1f1b28]"
            }`}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto pt-16">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 text-xs font-semibold text-[#8f8996] transition-colors hover:text-[#d1c8d5]"
        >
          <ArrowLeft size={14} /> Exit workspace
        </Link>
      </div>
    </aside>
  );
}

function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#111015] text-[#f3eee6]">
      <AdminSidebar active={active} />
      <div className="min-w-0 flex-1">
        <header className="flex h-[76px] items-center justify-between border-b hairline bg-[#0d0c10]/50 px-6 md:px-12 backdrop-blur-sm">
          <div className="flex items-center gap-3 lg:hidden">
            <Mark small />
            <span className="font-display tracking-[.14em]">ODHYAY</span>
          </div>
          <div className="hidden text-xs font-semibold text-[#8f8996] lg:block">
            Admin workspace <span className="mx-3 text-[#51485b]">/</span> <span className="text-amethyst">{active}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-[#8f8996]">
            <ShieldCheck size={16} className="text-[#82b49b]" /> Private access
          </div>
        </header>
        <main className="p-6 md:p-10 lg:p-12">{children}</main>
      </div>
    </div>
  );
}

export function AdminPersistentDashboardPage() {
  const books = trpc.library.list.useQuery();

  return (
    <AdminShell active="Overview">
      <div className="mx-auto max-w-[1280px]">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-8 border-b hairline pb-10 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-amethyst">Workspace Overview</p>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,6vw,4.8rem)] leading-[.95]">
              Welcome back.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#a9a1ad]">
              Here's a snapshot of your library's activity and performance.
            </p>
          </div>
          <Link
            href="/admin/books/new"
            className="focus-ring btn-primary"
          >
            <Plus size={16} /> Add a book
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-12 grid gap-px border hairline bg-[#332d39] sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total books", value: books.data?.length ?? 0, highlight: false },
            { label: "Published", value: books.data?.filter((b) => b.status === "published").length ?? 0, highlight: true },
            { label: "Drafts", value: books.data?.filter((b) => b.status === "draft").length ?? 0, highlight: false },
            { label: "Readers", value: "—", highlight: false },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`bg-[#151219] px-6 py-8 transition-all duration-300 hover:bg-[#1a161f] hover:shadow-lg ${
                highlight ? "border-l-2 border-[#b7a4d7]" : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996]">
                {label}
              </p>
              <p className="font-display mt-5 text-5xl text-[#eee8ef]">
                {value}
              </p>
              <p className="mt-4 text-[.7rem] font-bold uppercase tracking-[.12em] text-[#b7a4d7]">
                Updated today
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-16">
          <div className="border hairline bg-[#151219]">
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <div>
                <p className="eyebrow text-[#8f8996]">Activity</p>
                <h2 className="font-display mt-3 text-2xl">Recent books</h2>
              </div>
              <MoreHorizontal size={18} className="text-[#8f8996]" />
            </div>
            <div className="divide-y divide-[#2a2430]">
              {(books.data ?? []).slice(0, 5).map((book) => (
                <div
                  key={book.slug}
                  className="flex items-center gap-5 border-transparent px-6 py-5 transition-colors hover:bg-[#1f1b28]"
                >
                  <img
                    src={book.coverUrl ?? ""}
                    alt=""
                    className="h-14 w-10 rounded-sm object-cover cover-shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#d1c8d5]">
                      {book.title}
                    </p>
                    <p className="mt-1 text-xs text-[#8f8996]">
                      {book.authorName} · {book.pageCount} pages
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-[.7rem] font-bold uppercase tracking-[.12em] ${
                      book.status === "published"
                        ? "bg-[#1f3a32] text-[#82b49b]"
                        : "bg-[#2a202a] text-[#998897]"
                    }`}
                  >
                    <span className="h-1 w-1 rounded-full" />
                    {book.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

export function AdminPersistentBooksPage() {
  const books = trpc.library.list.useQuery();

  return (
    <AdminShell active="Books">
      <div className="mx-auto max-w-[1280px]">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-8 border-b hairline pb-10 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-amethyst">Content Library</p>
            <h1 className="font-display mt-5 text-[clamp(2.6rem,6vw,4.8rem)] leading-[.95]">
              Your books
            </h1>
            <p className="mt-4 text-sm text-[#8f8996]">
              {books.data?.length ?? 0} total · {books.data?.filter((b) => b.status === "published").length ?? 0} published
            </p>
          </div>
          <Link
            href="/admin/books/new"
            className="focus-ring btn-primary"
          >
            <Plus size={16} /> Add a book
          </Link>
        </div>

        {/* Table Controls */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-b hairline pb-5">
          <div className="flex items-center gap-3 text-xs font-medium text-[#8f8996]">
            <FileText size={16} />
            <span>{books.data?.length ?? 0} books in your library</span>
          </div>
          <button className="focus-ring flex items-center gap-2 text-xs font-semibold text-[#b7a4d7] transition-colors hover:text-[#cbbbe3]">
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="mt-8 overflow-x-auto rounded-sm border hairline">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b hairline bg-[#151219]">
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]">
                  Book
                </th>
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]">
                  Author
                </th>
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]">
                  Category
                </th>
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]">
                  Status
                </th>
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]">
                  Pages
                </th>
                <th className="px-6 py-4 text-[.7rem] font-bold uppercase tracking-[.15em] text-[#8f8996]" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2430]">
              {(books.data ?? []).map((book, idx) => (
                <tr
                  key={book.slug}
                  className={`transition-colors hover:bg-[#1f1b28] ${
                    idx === 0 ? "" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={book.coverUrl ?? ""}
                        alt=""
                        className="h-12 w-8 rounded-sm object-cover"
                      />
                      <span className="text-sm font-medium text-[#d1c8d5] line-clamp-1">
                        {book.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#a9a1ad]">
                      {book.authorName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#a9a1ad]">
                      {book.categoryName || "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-2 text-xs font-semibold ${
                        book.status === "published"
                          ? "text-[#82b49b]"
                          : "text-[#998897]"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {book.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#8f8996]">
                      {book.pageCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="focus-ring p-2 text-[#8f8996] transition-colors hover:text-[#d1c8d5]">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {books.data?.length === 0 && (
          <div className="mt-12 border border-dashed border-[#4a4052] bg-[#151219] px-8 py-16 text-center">
            <FileText size={28} className="mx-auto text-[#8f8996]" />
            <h3 className="font-display mt-6 text-2xl text-[#f3eee6]">
              No books yet
            </h3>
            <p className="mt-3 text-sm text-[#8f8996]">
              Create your first book to get started.
            </p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export function AdminPersistentNewBookPage() {
  const [published, setPublished] = useState(true);
  const [saved, setSaved] = useState(false);

  return (
    <AdminShell active="Books">
      <div className="mx-auto max-w-[1000px]">
        <Link
          href="/admin/books"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996] transition-colors hover:text-amethyst"
        >
          <ArrowLeft size={16} /> Back to books
        </Link>

        {/* Page Header */}
        <div className="mt-10 border-b hairline pb-10">
          <p className="eyebrow text-amethyst">Add New Book</p>
          <h1 className="font-display mt-6 text-[clamp(2.6rem,5vw,4rem)] leading-[.95]">
            Upload a book.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-[#a9a1ad]">
            Add the cover, enter the details, and publish it to your library. Readers will discover your book right away.
          </p>
        </div>

        {/* Form Layout */}
        <div className="mt-12 grid gap-14 lg:grid-cols-[300px_1fr]">
          {/* Cover Upload */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996]">
              Cover image
            </p>
            <div className="flex aspect-[2/3] flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#5a4e66] bg-[#151219] text-center transition-colors hover:border-[#b7a4d7] hover:bg-[#1a161f]">
              <div>
                <Upload size={24} className="mx-auto text-amethyst" />
                <p className="mt-5 text-[.75rem] font-bold uppercase tracking-[.16em] text-[#b7a4d7]">
                  Upload cover
                </p>
                <p className="mt-2 text-[.65rem] text-[#8f8996]">
                  WebP, JPG · 5MB max
                </p>
              </div>
            </div>
            <button className="focus-ring mt-5 w-full border border-[#5a4e66] bg-[#151219] py-3 text-xs font-bold uppercase tracking-[.14em] text-[#b7a4d7] transition-colors hover:border-amethyst hover:bg-[#1f1b28]">
              Choose file
            </button>

            {/* PDF Upload */}
            <div className="mt-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996]">
                Book PDF
              </p>
              <div className="rounded-sm border hairline bg-[#151219] p-5">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-amethyst" />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d1c8d5]">
                      No file chosen
                    </p>
                    <p className="mt-1 text-[.65rem] text-[#8f8996]">
                      PDF · 100MB max
                    </p>
                  </div>
                </div>
                <button className="focus-ring mt-4 w-full border border-[#5a4e66] bg-[#151219] py-2.5 text-[.7rem] font-bold uppercase tracking-[.14em] text-[#b7a4d7] transition-colors hover:border-amethyst hover:bg-[#1f1b28]">
                  Upload PDF
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-9">
            <div>
              <label htmlFor="title" className="eyebrow text-[#8f8996]">
                Title
              </label>
              <input
                id="title"
                type="text"
                className="mt-4 w-full border-b border-[#4a4052] bg-transparent py-3 text-lg font-medium text-[#f3eee6] outline-none transition focus:border-amethyst"
                placeholder="Book title"
              />
            </div>

            <div>
              <label htmlFor="author" className="eyebrow text-[#8f8996]">
                Author
              </label>
              <input
                id="author"
                type="text"
                className="mt-4 w-full border-b border-[#4a4052] bg-transparent py-3 text-lg font-medium text-[#f3eee6] outline-none transition focus:border-amethyst"
                placeholder="Author name"
              />
            </div>

            <div>
              <label htmlFor="category" className="eyebrow text-[#8f8996]">
                Category
              </label>
              <input
                id="category"
                type="text"
                className="mt-4 w-full border-b border-[#4a4052] bg-transparent py-3 text-lg font-medium text-[#f3eee6] outline-none transition focus:border-amethyst"
                placeholder="Book category"
              />
            </div>

            <div>
              <label htmlFor="pages" className="eyebrow text-[#8f8996]">
                Page count
              </label>
              <input
                id="pages"
                type="number"
                className="mt-4 w-full border-b border-[#4a4052] bg-transparent py-3 text-lg font-medium text-[#f3eee6] outline-none transition focus:border-amethyst"
                placeholder="Number of pages"
              />
            </div>

            <div>
              <label htmlFor="description" className="eyebrow text-[#8f8996]">
                Description
              </label>
              <textarea
                id="description"
                className="mt-4 w-full border border-[#4a4052] bg-transparent p-4 text-base text-[#f3eee6] outline-none transition focus:border-amethyst"
                placeholder="About this book"
                rows={5}
              />
            </div>

            {/* Publish Option */}
            <div className="rounded-sm border hairline bg-[#151219] p-4">
              <label htmlFor="publish" className="flex cursor-pointer items-center gap-3">
                <input
                  id="publish"
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-[#5a4e66] bg-[#111015] accent-[#b7a4d7]"
                />
                <span className="text-xs font-semibold text-[#d1c8d5]">
                  Publish immediately
                </span>
              </label>
              <p className="mt-2 text-[.7rem] text-[#8f8996]">
                If unchecked, this book will be saved as a draft and visible only to you.
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={() => setSaved(true)}
              className={`focus-ring w-full rounded-sm px-6 py-4 text-xs font-bold uppercase tracking-[.15em] transition-all duration-300 ${
                saved
                  ? "bg-[#82b49b] text-[#111015] shadow-lg"
                  : "btn-primary"
              }`}
            >
              {saved ? (
                <>
                  <Check size={15} className="mr-2 inline" /> Saved successfully
                </>
              ) : (
                "Save book"
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
