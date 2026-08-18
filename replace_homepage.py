#!/usr/bin/env python3
import sys

filepath = r"D:\Download\prompt-website (3)\client\src\pages\OdhyayPersistent.tsx"

# Read current file
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find HomePersistentPage
old_marker = "export function HomePersistentPage() {"
pos = content.find(old_marker)
if pos == -1:
    print("ERROR: Could not find old HomePersistentPage marker")
    sys.exit(1)

# Find next function
next_pos = content.find("export function LibraryPersistentPage", pos)
if next_pos == -1:
    next_pos = len(content)

# New HomePersistentPage content (using template literals with proper escaping)
new_block = """export function HomePersistentPage() {
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
"""

# Replace
new_content = content[:pos] + new_block + content[next_pos:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("HomePersistentPage replaced successfully")