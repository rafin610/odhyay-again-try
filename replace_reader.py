#!/usr/bin/env python3
import sys

filepath = r"D:\Download\prompt-website (3)\client\src\pages\OdhyayPersistent.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find ReaderPersistentPage
old_marker = "export function ReaderPersistentPage() {"
pos = content.find(old_marker)
if pos == -1:
    print("ERROR: Could not find ReaderPersistentPage marker")
    sys.exit(1)

# Find next function (or end of file)
next_pos = content.find("export function FavoritesPage", pos)
if next_pos == -1:
    next_pos = len(content)

# New ReaderPersistentPage content - redesigned for calm reading experience
new_block = '''export function ReaderPersistentPage() {
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
'''

# Replace
new_content = content[:pos] + new_block + content[next_pos:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("ReaderPersistentPage replaced successfully")