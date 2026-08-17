/* ODHYAY style: Quiet Editorial — shared chrome uses editorial labels, hairline rules, warm ivory type, and soft amethyst focus. */
import { Link, useLocation } from "wouter";
import { ArrowRight, CircleUserRound, Menu, Search, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { signOut } from "@/lib/supabase";
import { assets, type Book } from "@/lib/odhyayData";

// ============================================================================
// Mark Component (SVG)
// ============================================================================
export function Mark({ small = false }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={small ? "h-5 w-5" : "h-7 w-7"}
      fill="none"
    >
      <path
        d="M4 17V7"
        stroke="#B7A4D7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M9.3 17V4"
        stroke="#B7A4D7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M14.7 17v-7"
        stroke="#B7A4D7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M20 17V6"
        stroke="#B7A4D7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============================================================================
// Logo Component
// ============================================================================
export function Logo() {
  return (
    <Link
      href="/"
      className="focus-ring flex items-center gap-3"
      aria-label="ODHYAY home"
    >
      <Mark />
      <span className="font-display text-[1.35rem] tracking-[.18em]">
        ODHYAY
      </span>
    </Link>
  );
}

// ============================================================================
// Header Component (Navigation)
// ============================================================================
export function Header() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const nav = [
    { href: "/library", label: "Library" },
    { href: "/categories", label: "Categories" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="relative z-30 border-b hairline bg-[#111015]/95 backdrop-blur-md">
      <div className="container flex h-[76px] items-center justify-between gap-6">
        <Logo />

        {/* Desktop Navigation */}
        <nav
          className="site-nav hidden items-center md:flex"
          aria-label="Primary navigation"
          role="navigation"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`focus-ring text-[.76rem] font-semibold tracking-[.08em] transition-colors hover:text-amethyst ${
                location === item.href ? "text-amethyst" : "text-[#b5afbb]"
              }`}
              aria-current={location === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Section */}
        <div className="hidden items-center gap-4 md:flex" role="region" aria-label="User actions">
          <Link
            href="/search"
            className="focus-ring flex items-center gap-2 text-[#b5afbb] transition-colors hover:text-[#f3eee6]"
            aria-label="Search books"
          >
            <Search size={17} />
            <span className="text-[.72rem] font-semibold uppercase tracking-[.14em]">
              Search
            </span>
          </Link>

          <span className="h-5 w-px bg-[#332d39]" aria-hidden="true" />

          {user ? (
            <span className="flex items-center gap-4">
              <Link
                href="/admin"
                className="focus-ring flex items-center gap-2 text-[#b5afbb] transition-colors hover:text-[#f3eee6]"
                aria-label={`Admin dashboard for ${user.name || 'user'}`}
              >
                <CircleUserRound size={17} />
                <span className="max-w-[10rem] truncate text-[.72rem] font-semibold uppercase tracking-[.14em]">
                  {user.name ?? "Signed in"}
                </span>
              </Link>
              <button
                onClick={() => void signOut()}
                className="focus-ring text-[.72rem] font-semibold uppercase tracking-[.14em] text-[#8f8996] transition-colors hover:text-[#f3eee6]"
                aria-label="Sign out"
              >
                Sign out
              </button>
            </span>
          ) : (
            <Link
              href="/login"
              className="focus-ring flex items-center gap-2 text-[#b5afbb] transition-colors hover:text-[#f3eee6]"
              aria-label="Sign in to your account"
            >
              <CircleUserRound size={17} />
              <span className="text-[.72rem] font-semibold uppercase tracking-[.14em]">
                Login
              </span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="focus-ring rounded-sm p-2 text-[#f3eee6] md:hidden"
          onClick={() => setOpen(!open)}
          aria-label={`${open ? "Close" : "Open"} navigation menu`}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t hairline bg-[#151219] px-5 pb-6 pt-4 md:hidden" id="mobile-nav">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {nav.map((item) => (
              <Link
                onClick={() => setOpen(false)}
                key={item.href}
                href={item.href}
                className="border-b hairline py-4 text-sm font-semibold tracking-wide text-[#d9d2dd]"
                aria-current={location === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link
              onClick={() => setOpen(false)}
              href="/search"
              className="border-b hairline py-4 text-sm font-semibold tracking-wide text-[#d9d2dd]"
              aria-label="Search books"
            >
              Search
            </Link>
            <Link
              onClick={() => setOpen(false)}
              href="/login"
              className="py-4 text-left text-sm font-semibold tracking-wide text-[#d9d2dd]"
              aria-label={user ? "View account" : "Sign in"}
            >
              {user ? user.name ?? "Account" : "Login"}
            </Link>
            {user && (
              <button
                onClick={() => void signOut()}
                className="text-left text-sm font-semibold tracking-wide text-[#8f8996]"
                aria-label="Sign out"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

// ============================================================================
// Footer Component
// ============================================================================
export function Footer() {
  return (
    <footer className="border-t hairline bg-[#0d0c10] py-12">
      <div className="container flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-[#8f8996]">
            A calm digital library for curious minds. Find a book. Open it. Read.
          </p>
        </div>

        <div className="flex flex-col gap-4 text-xs text-[#8f8996] md:items-end">
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-[#f3eee6]">
              About
            </Link>
            <Link href="/library" className="hover:text-[#f3eee6]">
              Library
            </Link>
            <Link href="/admin" className="hover:text-[#f3eee6]">
              Admin
            </Link>
          </div>
          <span>© 2026 ODHYAY. Quietly made for readers.</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// PageFrame Component
// ============================================================================
export function PageFrame({
  children,
  footer = true,
}: {
  children: React.ReactNode;
  footer?: boolean;
}) {
  return (
    <div className="min-h-screen bg-[#111015] text-[#f3eee6]">
      <Header />
      {children}
      {footer && <Footer />}
    </div>
  );
}

// ============================================================================
// SectionLabel Component
// ============================================================================
export function SectionLabel({
  children,
  number,
}: {
  children: React.ReactNode;
  number?: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3 text-[#928b9a]">
      <Mark small />
      <span className="eyebrow">
        {number ? `${number} / ` : ""}
        {children}
      </span>
      <span className="h-px flex-1 bg-[#332d39]" />
    </div>
  );
}

// ============================================================================
// SearchBar Component
// ============================================================================
export function SearchBar({
  compact = false,
  defaultValue = "",
}: {
  compact?: boolean;
  defaultValue?: string;
}) {
  const [, setLocation] = useLocation();
  const [value, setValue] = useState(defaultValue);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocation(
      `/search${value.trim() ? `?q=${encodeURIComponent(value.trim())}` : ""}`
    );
  };

  return (
    <form
      onSubmit={submit}
      className={`group flex items-center gap-3 border-b border-[#5a5163] transition-colors focus-within:border-[#b7a4d7] ${
        compact ? "max-w-md" : "max-w-[620px]"
      }`}
      role="search"
    >
      <Search
        size={compact ? 17 : 20}
        className="shrink-0 text-[#8f8996] transition-colors group-focus-within:text-amethyst"
        aria-hidden="true"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={`w-full bg-transparent py-4 text-[#f3eee6] outline-none placeholder:text-[#716b77] ${
          compact ? "text-sm" : "text-base"
        }`}
        placeholder="Search by title, author, or category"
        aria-label="Search books by title, author, or category"
        autoComplete="off"
      />
      <button
        type="submit"
        className="focus-ring px-1 py-4 text-[.66rem] font-bold uppercase tracking-[.18em] text-amethyst"
        aria-label="Submit search"
      >
        Search
      </button>
    </form>
  );
}

// ============================================================================
// BookCard Component
// ============================================================================
export function BookCard({
  book,
  index = 0,
}: {
  book: Book;
  index?: number;
}) {
  return (
    <Link
      href={`/book/${book.slug}`}
      className={`book-card focus-ring group block reveal reveal-delay-${Math.min(
        index,
        3
      )}`}
    >
      {/* Cover Image */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[#24202a] cover-shadow">
        <img
          src={book.cover}
          alt={`${book.title} cover`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111015]/50 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-40" />
        
        {/* Category Badge */}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 bg-[#111015]/80 backdrop-blur-sm px-2.5 py-1.5 text-[.65rem] font-bold uppercase tracking-[.16em] text-[#d1c8d5] border border-[#5a5163]/50">
          <span className="w-1 h-1 rounded-full bg-[#b7a4d7]" />
          {book.category}
        </span>
        
        {/* Progress Bar */}
        {book.progress ? (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#302a35]">
            <div
              className="h-full bg-gradient-to-r from-[#b7a4d7] to-[#cbbbe3] transition-all duration-500"
              style={{ width: `${book.progress}%` }}
            />
          </div>
        ) : null}
      </div>

      {/* Book Metadata */}
      <div className="book-meta pt-5">
        <h3 className="font-display text-[1.4rem] leading-tight text-[#f3eee6] transition-colors duration-200 group-hover:text-amethyst line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-2.5 text-xs text-[#8f8996] font-medium line-clamp-1">
          {book.author}
        </p>
        <div className="mt-4 flex items-center gap-3 text-[.68rem] font-semibold uppercase tracking-[.14em] text-[#706a77]">
          <span>{book.pages} pages</span>
          <span className="w-1 h-1 rounded-full bg-[#645b6c]" />
          <span className="line-clamp-1">{book.category}</span>
        </div>
      </div>
    </Link>
  );
}

// ============================================================================
// BookGrid Component
// ============================================================================
export function BookGrid({ items }: { items: Book[] }) {
  return (
    <div className="book-grid grid grid-cols-2 gap-x-4 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
      {items.map((book, index) => (
        <BookCard key={book.slug} book={book} index={index} />
      ))}
    </div>
  );
}
