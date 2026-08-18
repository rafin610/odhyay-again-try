#!/usr/bin/env python3
import sys

filepath = r"D:\Download\prompt-website (3)\client\src\pages\OdhyayPersistentAdmin.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Find AdminPersistentDashboardPage start
old_marker = "// Overview Dashboard Page"
pos = content.find(old_marker)
if pos == -1:
    print("ERROR: Could not find overview marker")
    sys.exit(1)

# Find AdminPersistentBooksPage start
next_pos = content.find("// Books Management Page")
if next_pos == -1:
    next_pos = content.find("export function AdminPersistentBooksPage", pos)
if next_pos == -1:
    next_pos = len(content)

# New Admin Dashboard content
new_dashboard = '''// Overview Dashboard Page
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
        <div className="flex flex-col sm:flex-row justify-between gap-6 border-b hairline pb-8 sm:items-end">
          <div>
            <p className="eyebrow text-amethyst">Overview</p>
            <h1 className="font-display mt-3 text-4xl sm:text-5xl text-[#f3eee6]">
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
        <div className="mt-8 grid gap-2 border hairline bg-[var(--elevated)] sm:grid-cols-2 lg:grid-cols-4 rounded-sm overflow-hidden">
          {[
            { label: "Total Books", value: items.length, highlight: false },
            { label: "Published", value: published, highlight: true },
            { label: "Drafts", value: drafts, highlight: false },
            { label: "Categories", value: categoriesCount, highlight: false },
          ].map(({ label, value, highlight }) => (
            <div
              key={label}
              className={`p-6 transition-colors hover:bg-[var(--surface)] ${
                highlight ? "border-l-2 border-amethyst" : ""
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[.11em] text-[#716a79]">
                {label}
              </p>
              <p className="font-display mt-3 text-3xl text-[var(--text)]">
                {records.isLoading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Books */}
        <div className="mt-12 rounded-lg border hairline bg-[var(--elevated)] p-8 sm:p-10">
          <div className="flex items-center justify-between border-b hairline pb-5">
            <div>
              <p className="eyebrow text-[#716a79]">Recent activity</p>
              <h2 className="mt-2 font-display text-xl text-[#f3eee6]">
                Latest Additions
              </h2>
            </div>
            <Link
              href="/admin/books"
              className="text-sm font-semibold text-amethyst hover:underline"
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
            <div className="mt-6 divide-y divide-[var(--border)]">
              {items.slice(0, 5).map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 py-4 transition-colors hover:bg-[var(--surface)] rounded-sm px-2"
                >
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt=""
                      className="h-12 w-9 object-cover rounded-xs shrink-0"
                    />
                  ) : (
                    <div className="flex h-12 w-9 items-center justify-center bg-[var(--border)] text-amethyst rounded-xs shrink-0">
                      <FileText size={15} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--mutedText)]">
                      {book.title}
                    </p>
                    <p className="mt-0.5 text-xs text-[#716a79]">
                      {book.authorName} · {book.categoryName ?? "Uncategorized"}
                    </p>
                  </div>
                  <span
                    className={`text-[.62rem] font-bold uppercase tracking-[.12em] px-2 py-1 rounded-${
                      book.status === "published" ? "left" : "right"
                    } ${
                      book.status === "published"
                        ? "bg-[var(--success)] text-[var(--background)]"
                        : "bg-[var(--elevated)] text-amethyst"
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
'''

# Replace
new_content = content[:pos] + new_dashboard + content[next_pos:]

with open(filepath, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Admin dashboard replaced successfully")