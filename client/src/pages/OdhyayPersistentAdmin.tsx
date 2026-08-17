/* ODHYAY style: Admin Workspace — clean, professional management system with full CRUD operations. */
import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Filter,
  LibraryBig,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  Trash2,
  Edit,
  X,
  Menu,
  BookOpen,
  FolderKanban,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { Mark, Logo } from "@/components/OdhyayShell";
import { EmptyState } from "@/components/EmptyState";
import { TableRowSkeleton } from "@/components/LoadingSkeleton";
import { trpc } from "@/lib/trpc";
import { uploadCoverFile, uploadPdfFile } from "@/lib/upload";

type AdminRecord = {
  id: number;
  title: string;
  slug: string;
  coverUrl: string | null;
  pdfKey: string | null;
  authorName: string;
  categoryName: string | null;
  status: "draft" | "published";
  pageCount: number;
  updatedAt: Date;
  description?: string;
};

// Access Control Gate for Admin Routes
function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111015] p-6 text-sm text-[#8f8996]">
        Checking admin privileges…
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111015] p-6 text-[#f3eee6]">
        <div className="max-w-md border hairline bg-[#151219] p-8 text-center rounded-sm">
          <Mark />
          <h1 className="font-display mt-6 text-3xl">Private Workspace</h1>
          <p className="mt-4 text-sm leading-7 text-[#958d9b]">
            Please sign in with an administrator account to access the ODHYAY library controls.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/login?next=/admin"
              className="btn-primary"
            >
              Sign In
            </Link>
            <Link
              href="/"
              className="btn-secondary"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Sidebar Navigation
function AdminSidebar({
  active,
  onCloseMobile,
}: {
  active: string;
  onCloseMobile?: () => void;
}) {
  const [, navigate] = useLocation();

  const links = [
    { label: "Overview", href: "/admin", icon: LibraryBig },
    { label: "Books", href: "/admin/books", icon: FileText },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r hairline bg-[#151219] p-6">
      <Logo />
      <p className="eyebrow mt-12 text-[#777080]">Workspace</p>
      <nav className="mt-4 flex flex-col gap-1.5">
        {links.map(({ label, href, icon: Icon }) => (
          <button
            key={href}
            onClick={() => {
              navigate(href);
              if (onCloseMobile) onCloseMobile();
            }}
            className={`focus-ring flex items-center gap-3 px-3 py-3 text-left text-sm font-medium transition-all rounded-xs ${
              active === label
                ? "bg-[#2c2534] text-amethyst shadow-sm"
                : "text-[#9b93a1] hover:text-[#f3eee6] hover:bg-[#1f1b28]"
            }`}
          >
            <Icon size={17} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-12 border-t hairline">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 text-xs font-semibold text-[#817989] hover:text-[#f3eee6] transition-colors"
        >
          <ArrowLeft size={14} /> Exit workspace
        </Link>
      </div>
    </aside>
  );
}

// Layout Shell for Admin Pages
function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <AdminGate>
      <div className="flex min-h-screen bg-[#111015] text-[#f3eee6]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <AdminSidebar active={active} />
        </div>

        {/* Mobile Drawer */}
        {mobileMenu && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileMenu(false)}
            />
            <div className="relative z-10 w-64 max-w-full bg-[#151219]">
              <AdminSidebar
                active={active}
                onCloseMobile={() => setMobileMenu(false)}
              />
            </div>
          </div>
        )}

        <div className="min-w-0 flex-1 flex flex-col">
          <header className="flex h-[76px] items-center justify-between border-b hairline px-5 md:px-10 bg-[#0d0c10]/40 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileMenu(true)}
                className="p-2 text-[#f3eee6] lg:hidden rounded-sm focus-ring"
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 lg:hidden">
                <Mark small />
                <span className="font-display tracking-[.14em] text-sm">ODHYAY</span>
              </div>
              <div className="hidden text-xs font-semibold text-[#8f8996] lg:block">
                Admin workspace <span className="mx-2 text-[#51485b]">/</span>{" "}
                <span className="text-amethyst">{active}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8f8996]">
              <ShieldCheck size={16} className="text-[#82b49b]" />
              <span className="hidden sm:inline">Protected Admin Access</span>
            </div>
          </header>

          <main className="p-5 md:p-10 flex-1">{children}</main>
        </div>
      </div>
    </AdminGate>
  );
}

// Overview Dashboard Page
export function AdminPersistentDashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const records = trpc.admin.listBooks.useQuery(undefined, { enabled: isAdmin });
  const items = (records.data ?? []) as AdminRecord[];
  const published = items.filter((item) => item.status === "published").length;
  const drafts = items.length - published;
  const categoriesCount = new Set(
    items.map((item) => item.categoryName).filter(Boolean)
  ).size;

  return (
    <AdminShell active="Overview">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 border-b hairline pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-amethyst">Overview</p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl">
              Library Status
            </h1>
            <p className="mt-2 text-sm text-[#8f8996]">
              Live metrics and content overview for Odhyay.
            </p>
          </div>
          <Link href="/admin/books/new" className="btn-primary focus-ring">
            <Plus size={16} /> Add a book
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-8 grid gap-px border hairline bg-[#332d39] sm:grid-cols-2 lg:grid-cols-4 rounded-sm overflow-hidden">
          {[
            { label: "Total Books", value: items.length, highlight: false },
            { label: "Published", value: published, highlight: true },
            { label: "Drafts", value: drafts, highlight: false },
            { label: "Categories", value: categoriesCount, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`bg-[#151219] p-6 transition-colors hover:bg-[#1a161f] ${
                highlight ? "border-l-2 border-amethyst" : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#837b8b]">
                {label}
              </p>
              <p className="font-display mt-4 text-4xl text-[#eee8ef]">
                {records.isLoading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Books */}
        <div className="mt-12 border hairline bg-[#151219] p-6 sm:p-8 rounded-sm">
          <div className="flex items-center justify-between border-b hairline pb-5">
            <div>
              <p className="eyebrow text-[#817989]">Recent activity</p>
              <h2 className="mt-2 font-display text-2xl">
                Latest Additions
              </h2>
            </div>
            <Link
              href="/admin/books"
              className="text-xs font-semibold text-amethyst hover:underline"
            >
              View all
            </Link>
          </div>

          {records.isLoading ? (
            <div className="mt-6 space-y-3">
              <TableRowSkeleton />
              <TableRowSkeleton />
              <TableRowSkeleton />
            </div>
          ) : items.length ? (
            <div className="mt-6 divide-y divide-[#2a2430]">
              {items.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-[#1a161f] px-2 rounded-xs"
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt=""
                      className="h-12 w-9 object-cover rounded-xs"
                    />
                  ) : (
                    <div className="flex h-12 w-9 items-center justify-center bg-[#27212d] text-amethyst rounded-xs">
                      <FileText size={15} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#ddd5df]">
                      {book.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#817989]">
                      {book.authorName} · {book.categoryName ?? "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`text-[.64rem] font-bold uppercase tracking-[.14em] px-2 py-1 rounded-xs ${
                      book.status === "published"
                        ? "bg-[#183025] text-[#82b49b]"
                        : "bg-[#28212c] text-[#cda66c]"
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                title="The shelf is empty"
                description="Add the first book to start building your library."
                actionHref="/admin/books/new"
                actionLabel="Add a book"
              />
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// Books Management Page with Edit & Delete Modals
export function AdminPersistentBooksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const records = trpc.admin.listBooks.useQuery(undefined, { enabled: isAdmin });
  const items = (records.data ?? []) as AdminRecord[];
  const utils = trpc.useUtils();

  const [searchQuery, setSearchQuery] = useState("");
  const [editingBook, setEditingBook] = useState<AdminRecord | null>(null);
  const [deletingBook, setDeletingBook] = useState<AdminRecord | null>(null);

  // Mutations
  const updateMutation = trpc.admin.updateBook.useMutation({
    onSuccess: () => {
      toast.success("Book updated successfully.");
      void utils.admin.listBooks.invalidate();
      void utils.library.list.invalidate();
      setEditingBook(null);
    },
    onError: (err) => toast.error(err.message || "Failed to update book."),
  });

  const deleteMutation = trpc.admin.deleteBook.useMutation({
    onSuccess: () => {
      toast.success("Book deleted permanently.");
      void utils.admin.listBooks.invalidate();
      void utils.library.list.invalidate();
      setDeletingBook(null);
    },
    onError: (err) => toast.error(err.message || "Failed to delete book."),
  });

  const filteredItems = items.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.categoryName &&
        b.categoryName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminShell active="Books">
      <div className="mx-auto max-w-[1120px]">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 border-b hairline pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow text-amethyst">Content Management</p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl">
              Books Library
            </h1>
            <p className="mt-2 text-sm text-[#8f8996]">
              {items.length} total books registered
            </p>
          </div>
          <Link href="/admin/books/new" className="btn-primary focus-ring">
            <Plus size={16} /> Add a book
          </Link>
        </div>

        {/* Search & Filter */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b hairline pb-5">
          <div className="flex items-center gap-3 bg-[#151219] px-4 py-2.5 rounded-sm border hairline flex-1 max-w-md">
            <Search size={16} className="text-[#8f8996]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, or category…"
              className="bg-transparent text-sm text-[#f3eee6] outline-none w-full placeholder:text-[#6a6373]"
            />
          </div>
          <span className="text-xs font-semibold text-[#8f8996]">
            Showing {filteredItems.length} of {items.length} books
          </span>
        </div>

        {/* Books Table */}
        {records.isLoading ? (
          <div className="mt-6 space-y-3">
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
          </div>
        ) : filteredItems.length ? (
          <div className="mt-6 overflow-x-auto rounded-sm border hairline">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b hairline bg-[#151219] text-[.66rem] font-bold uppercase tracking-[.15em] text-[#716978]">
                  <th className="px-5 py-4">Book</th>
                  <th className="px-5 py-4">Author</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Pages</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2430]">
                {filteredItems.map((book) => (
                  <tr
                    key={book.id}
                    className="transition-colors hover:bg-[#1a161f] text-sm"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt=""
                            className="h-12 w-8 object-cover rounded-xs shrink-0"
                          />
                        ) : (
                          <div className="flex h-12 w-8 items-center justify-center bg-[#27212d] text-amethyst rounded-xs shrink-0">
                            <FileText size={14} />
                          </div>
                        )}
                        <span className="font-medium text-[#e1d9e2] line-clamp-1">
                          {book.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#98909f]">{book.authorName}</td>
                    <td className="px-5 py-4 text-[#98909f]">
                      {book.categoryName ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          book.status === "published"
                            ? "text-[#82b49b]"
                            : "text-[#cda66c]"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {book.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#777080]">
                      {book.pageCount || "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingBook(book)}
                          className="focus-ring p-2 text-[#8f8996] hover:text-amethyst transition-colors"
                          title="Edit book"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingBook(book)}
                          className="focus-ring p-2 text-[#8f8996] hover:text-[#c76b6b] transition-colors"
                          title="Delete book"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No books found"
              description={
                searchQuery
                  ? `No books match "${searchQuery}".`
                  : "Add your first book to begin."
              }
              actionHref="/admin/books/new"
              actionLabel="Add a book"
            />
          </div>
        )}

        {/* Edit Book Modal */}
        {editingBook && (
          <EditBookModal
            book={editingBook}
            onClose={() => setEditingBook(null)}
            onSave={(data) => updateMutation.mutate(data)}
            isSaving={updateMutation.isPending}
          />
        )}

        {/* Delete Confirmation Modal */}
        {deletingBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setDeletingBook(null)}
            />
            <div className="relative z-10 w-full max-w-md border hairline bg-[#151219] p-8 text-center rounded-sm">
              <Trash2 size={28} className="mx-auto text-[#c76b6b]" />
              <h3 className="font-display mt-4 text-2xl">
                Delete this book permanently?
              </h3>
              <p className="mt-3 text-sm text-[#8f8996] leading-6">
                “{deletingBook.title}” will be removed from the library. This action cannot be undone.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => setDeletingBook(null)}
                  className="btn-secondary focus-ring"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate({ id: deletingBook.id })}
                  disabled={deleteMutation.isPending}
                  className="focus-ring inline-flex items-center gap-2 bg-[#c76b6b] px-5 py-3 text-xs font-bold uppercase tracking-[.15em] text-white hover:bg-[#d87c7c] disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting…" : "Delete Book"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

// Edit Book Modal Component
function EditBookModal({
  book,
  onClose,
  onSave,
  isSaving,
}: {
  book: AdminRecord;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
}) {
  const [title, setTitle] = useState(book.title);
  const [authorName, setAuthorName] = useState(book.authorName);
  const [categoryName, setCategoryName] = useState(book.categoryName ?? "");
  const [description, setDescription] = useState(book.description ?? "");
  const [pageCount, setPageCount] = useState(String(book.pageCount || ""));
  const [coverUrl, setCoverUrl] = useState(book.coverUrl ?? "");
  const [pdfKey, setPdfKey] = useState(book.pdfKey ?? "");
  const [published, setPublished] = useState(book.status === "published");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      id: book.id,
      title,
      authorName,
      categoryName,
      description,
      pageCount: pageCount ? Number(pageCount) : 0,
      coverUrl: coverUrl || null,
      pdfKey: pdfKey || null,
      status: published ? "published" : "draft",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl border hairline bg-[#151219] p-6 sm:p-8 rounded-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b hairline pb-4">
          <h2 className="font-display text-2xl text-[#f3eee6]">Edit Book</h2>
          <button onClick={onClose} className="p-1 text-[#8f8996] hover:text-[#f3eee6]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="eyebrow text-[#817989]">Title</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-2.5 text-base text-[#f3eee6] outline-none focus:border-amethyst"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="eyebrow text-[#817989]">Author</label>
              <input
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-2.5 text-sm text-[#f3eee6] outline-none focus:border-amethyst"
              />
            </div>
            <div>
              <label className="eyebrow text-[#817989]">Category</label>
              <input
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-2.5 text-sm text-[#f3eee6] outline-none focus:border-amethyst"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="eyebrow text-[#817989]">Page Count</label>
              <input
                type="number"
                min="0"
                value={pageCount}
                onChange={(e) => setPageCount(e.target.value)}
                className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-2.5 text-sm text-[#f3eee6] outline-none focus:border-amethyst"
              />
            </div>
            <div>
              <label className="eyebrow text-[#817989]">Cover Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadCoverFile(file)
                    .then((res) => {
                      setCoverUrl(res.publicUrl);
                      toast.success("Cover uploaded.");
                    })
                    .catch(() => toast.error("Cover upload failed."));
                }}
                className="mt-2 text-xs text-[#8f8996]"
              />
            </div>
          </div>

          <div>
            <label className="eyebrow text-[#817989]">Description</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full resize-none border border-[#4a4052] bg-[#111015] p-3 text-sm text-[#f3eee6] outline-none focus:border-amethyst rounded-xs"
            />
          </div>

          <div className="flex items-center justify-between border-t hairline pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 rounded accent-amethyst"
              />
              <span className="text-xs font-semibold text-[#d1c8d5]">
                Published to Library
              </span>
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// Create New Book Page
export function AdminPersistentNewBookPage() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const create = trpc.admin.createBook.useMutation({
    onSuccess: async () => {
      await utils.admin.listBooks.invalidate();
      await utils.library.list.invalidate();
      await utils.library.categories.invalidate();
      toast.success("Book created successfully.");
      navigate("/admin/books");
    },
    onError: (error) =>
      toast.error(error.message || "The book could not be saved."),
  });

  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [pageCount, setPageCount] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [pdfKey, setPdfKey] = useState("");
  const [published, setPublished] = useState(true);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    create.mutate({
      title,
      authorName,
      categoryName,
      description,
      pageCount: pageCount ? Number(pageCount) : undefined,
      coverUrl: coverUrl || undefined,
      pdfKey: pdfKey || undefined,
      status: published ? "published" : "draft",
    });
  };

  return (
    <AdminShell active="Books">
      <div className="mx-auto max-w-[900px]">
        <Link
          href="/admin/books"
          className="focus-ring inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[#8f8996] hover:text-amethyst"
        >
          <ArrowLeft size={15} /> Back to books
        </Link>

        <div className="mt-8 border-b hairline pb-8">
          <p className="eyebrow text-amethyst">New Content</p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl">Add a book</h1>
          <p className="mt-2 text-sm text-[#8f8996]">
            Upload the cover, enter metadata, and attach the PDF document.
          </p>
        </div>

        <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
          <div>
            <div className="flex aspect-[2/3] items-center justify-center border border-dashed border-[#5a4e66] bg-[#151219] text-center rounded-sm overflow-hidden relative">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover preview" className="h-full w-full object-cover" />
              ) : (
                <div className="p-4">
                  <Upload size={24} className="mx-auto text-amethyst" />
                  <p className="mt-3 text-xs font-semibold text-[#b8afbd]">
                    Cover Image
                  </p>
                </div>
              )}
            </div>

            <label className="mt-4 block">
              <span className="text-[.68rem] font-bold uppercase tracking-[.14em] text-[#b8afbd] block mb-2">
                Upload Cover
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadCoverFile(file)
                    .then((res) => {
                      setCoverUrl(res.publicUrl);
                      toast.success("Cover uploaded.");
                    })
                    .catch(() => toast.error("Cover upload failed."));
                }}
                className="w-full text-xs text-[#8f8996]"
              />
            </label>

            <div className="mt-8 rounded-sm border hairline bg-[#151219] p-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-amethyst" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#d1c8d5]">
                    PDF File
                  </p>
                  <p className="mt-1 text-[.65rem] text-[#8f8996] truncate">
                    {pdfKey ? pdfKey : "No PDF uploaded"}
                  </p>
                </div>
              </div>
              <label className="mt-4 block">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadPdfFile(file)
                      .then((res) => {
                        setPdfKey(res.key);
                        toast.success("PDF uploaded to storage.");
                      })
                      .catch(() => toast.error("PDF upload failed."));
                  }}
                  className="w-full text-xs text-[#8f8996]"
                />
              </label>
            </div>
          </div>

          <div className="space-y-7">
            <label className="block">
              <span className="eyebrow text-[#817989]">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-3 text-lg text-[#f3eee6] outline-none focus:border-amethyst"
                placeholder="The title of the book"
              />
            </label>

            <label className="block">
              <span className="eyebrow text-[#817989]">Author</span>
              <input
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-3 text-base text-[#f3eee6] outline-none focus:border-amethyst"
                placeholder="Author name"
              />
            </label>

            <div className="grid gap-7 sm:grid-cols-2">
              <label>
                <span className="eyebrow text-[#817989]">Category</span>
                <input
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-3 text-sm text-[#f3eee6] outline-none focus:border-amethyst"
                  placeholder="e.g. উপন্যাস, বিজ্ঞান"
                />
              </label>
              <label>
                <span className="eyebrow text-[#817989]">Page count</span>
                <input
                  type="number"
                  min="0"
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  className="mt-2 w-full border-b border-[#4a4052] bg-transparent py-3 text-sm text-[#f3eee6] outline-none focus:border-amethyst"
                  placeholder="Number of pages"
                />
              </label>
            </div>

            <label className="block">
              <span className="eyebrow text-[#817989]">Description</span>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 w-full resize-none border border-[#4a4052] bg-[#151219] p-4 text-sm leading-7 text-[#f3eee6] outline-none focus:border-amethyst rounded-xs"
                placeholder="Short description or synopsis for readers…"
              />
            </label>

            <div className="flex items-center justify-between border-t hairline pt-6">
              <div>
                <p className="text-sm font-semibold text-[#ded6e0]">
                  Publish immediately
                </p>
                <p className="mt-1 text-xs text-[#817989]">
                  Published books are visible in the public library catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPublished(!published)}
                className={`focus-ring relative h-6 w-11 rounded-full transition-colors ${
                  published ? "bg-amethyst" : "bg-[#403747]"
                }`}
                aria-label="Toggle publish"
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-[#17121c] transition-transform ${
                    published ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            <button
              disabled={create.isPending}
              className="btn-primary w-full justify-center"
            >
              {create.isPending ? (
                "Saving Book…"
              ) : (
                <>
                  <Check size={16} /> Save Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
