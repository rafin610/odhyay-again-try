/* ODHYAY style: Premium In-App PDF Reader — calm, distraction-free reading experience. */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Minus,
  Plus,
  Sparkles,
  Maximize2,
  Minimize2,
  BookOpen,
} from "lucide-react";

interface PDFReaderProps {
  book: {
    id: number;
    slug: string;
    title: string;
    categoryName: string | null;
    authorName: string;
    pageCount: number;
  };
  page: number;
  pages: number;
  zoom: number;
  theme: string;
  onPageChange: (page: number) => void;
  onZoomChange: (zoom: number) => void;
  onThemeChange: (theme: string) => void;
  onBookmark: () => void;
  pdfUrl?: string;
  isLoadingPdf?: boolean;
}

// Header Navigation for Reader
function ReaderHeader({
  book,
  theme,
  onTheme,
}: {
  book: PDFReaderProps["book"];
  theme: string;
  onTheme: (theme: string) => void;
}) {
  const themeLabel =
    theme === "dark" ? "Night" : theme === "daylight" ? "Daylight" : "Sepia";

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#111015]/95 px-6 backdrop-blur-md md:px-8">
      <Link
        href={`/book/${book.slug}`}
        className="focus-ring flex items-center gap-2.5 text-xs font-semibold text-[#c1bac5] transition hover:text-[#f3eee6]"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to book</span>
      </Link>

      <div className="flex items-center gap-2 flex-1 justify-center max-w-md mx-4">
        <h1 className="font-display text-sm tracking-[.10em] text-[#f3eee6] truncate text-center">
          {book.title}
        </h1>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#8f8996]">
        <button
          onClick={() =>
            onTheme(
              theme === "dark"
                ? "daylight"
                : theme === "daylight"
                ? "sepia"
                : "dark"
            )
          }
          className="focus-ring rounded-sm p-2 text-[#d7cedb] transition hover:bg-[#2a2430]"
          title={`Change reading theme (Current: ${themeLabel})`}
          aria-label={`Change reading theme, currently ${themeLabel}`}
        >
          <Sparkles size={16} />
        </button>
        <span className="hidden sm:inline text-[#5a5163]">·</span>
        <span className="hidden sm:inline text-[#8f8996]">{themeLabel}</span>
      </div>
    </header>
  );
}

// Controls Toolbar - Desktop
function ReaderControlsDesktop({
  page,
  pages,
  zoom,
  onPageChange,
  onZoomChange,
  onBookmark,
  onFullscreen,
  isFullscreen,
}: {
  page: number;
  pages: number;
  zoom: number;
  onPageChange: (p: number) => void;
  onZoomChange: (z: number) => void;
  onBookmark: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-[#3d3547] bg-[#17141c]/98 px-4 py-3 backdrop-blur-lg text-[#d7cedb] shadow-2xl">
      <button
        className="focus-ring p-2 rounded transition hover:bg-[#2a2430] disabled:opacity-30"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        title="Previous page (← arrow)"
      >
        <ArrowLeft size={16} />
      </button>

      <div className="flex items-center gap-2 border-l border-r border-[#3a3242] px-3">
        <input
          value={page}
          onChange={(e) =>
            onPageChange(
              Math.min(pages, Math.max(1, Number(e.target.value) || 1))
            )
          }
          className="w-10 bg-transparent text-center text-sm font-semibold outline-none text-[#d7cedb]"
          aria-label="Current page number"
        />
        <span className="text-xs text-[#746c7d]">/ {pages}</span>
      </div>

      <button
        className="focus-ring p-2 rounded transition hover:bg-[#2a2430] disabled:opacity-30"
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        aria-label="Next page"
        title="Next page (→ arrow)"
      >
        <ArrowRight size={16} />
      </button>

      <span className="h-4 w-px bg-[#3a3242]" />

      <button
        className="focus-ring p-2 rounded transition hover:bg-[#2a2430]"
        onClick={() => onZoomChange(Math.max(0.7, zoom - 0.1))}
        aria-label="Zoom out"
        title="Zoom out (- key)"
      >
        <Minus size={16} />
      </button>

      <span className="text-xs text-[#746c7d] min-w-[2.5rem] text-center font-semibold">
        {Math.round(zoom * 100)}%
      </span>

      <button
        className="focus-ring p-2 rounded transition hover:bg-[#2a2430]"
        onClick={() => onZoomChange(Math.min(1.5, zoom + 0.1))}
        aria-label="Zoom in"
        title="Zoom in (+ key)"
      >
        <Plus size={16} />
      </button>

      <span className="h-4 w-px bg-[#3a3242]" />

      <button
        className="focus-ring p-2 rounded text-amethyst transition hover:bg-[#2a2430]"
        onClick={onBookmark}
        aria-label="Save bookmark"
        title="Bookmark current page"
      >
        <Bookmark size={16} />
      </button>

      <button
        className="focus-ring p-2 rounded text-[#d7cedb] transition hover:bg-[#2a2430]"
        onClick={onFullscreen}
        aria-label="Toggle fullscreen"
        title="Fullscreen mode"
      >
        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
      </button>
    </div>
  );
}

// Mobile Reader Controls
function ReaderControlsMobile({
  page,
  pages,
  onPageChange,
  onBookmark,
}: {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  onBookmark: () => void;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-center justify-between gap-3 bg-[#131118]/95 px-4 py-3 backdrop-blur-md border-t hairline text-[#d7cedb]">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="focus-ring rounded-lg bg-[#2a2430] p-3 text-[#d7cedb] transition active:scale-95 disabled:opacity-30"
        aria-label="Previous page"
      >
        <ArrowLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8f8996]">Page</span>
        <input
          value={page}
          onChange={(e) =>
            onPageChange(
              Math.min(pages, Math.max(1, Number(e.target.value) || 1))
            )
          }
          className="w-12 bg-[#2a2430] text-center text-sm font-semibold text-[#d7cedb] rounded outline-none p-1.5"
          aria-label="Current page"
        />
        <span className="text-xs text-[#8f8996]">of {pages}</span>
      </div>

      <button
        onClick={onBookmark}
        className="focus-ring rounded-lg bg-[#2a2430] p-3 text-amethyst transition active:scale-95"
        aria-label="Save bookmark"
      >
        <Bookmark size={18} />
      </button>

      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="focus-ring rounded-lg bg-[#2a2430] p-3 text-[#d7cedb] transition active:scale-95 disabled:opacity-30"
        aria-label="Next page"
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}

// Progress Bar
function ProgressBar({ page, pages }: { page: number; pages: number }) {
  const percentage = Math.round((page / pages) * 100);
  return (
    <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-[#1a171f]">
      <div
        className="h-full bg-gradient-to-r from-[#b7a4d7] to-[#cbbbe3] transition-all duration-300"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={page}
        aria-valuemin={1}
        aria-valuemax={pages}
      />
    </div>
  );
}

export function PDFReader({
  book,
  page,
  pages,
  zoom,
  theme,
  onPageChange,
  onZoomChange,
  onThemeChange,
  onBookmark,
  pdfUrl,
  isLoadingPdf,
}: PDFReaderProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const themeClass =
    theme === "sepia"
      ? "bg-[#3b3026]"
      : theme === "daylight"
      ? "bg-[#d9d0bd]"
      : "bg-[#111015]";

  const paperClass =
    theme === "sepia"
      ? "bg-[#e1cfaa] text-[#483d32]"
      : theme === "daylight"
      ? "bg-[#eee8da] text-[#413c38]"
      : "bg-[#211e25] text-[#d9d2d8]";

  // Append parameters to disable browser native download/toolbar UI where supported
  const securePdfUrl = pdfUrl
    ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=${page}`
    : undefined;

  return (
    <div
      className={`min-h-screen ${themeClass} transition-colors duration-300 select-none`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReaderHeader book={book} theme={theme} onTheme={onThemeChange} />
      <ProgressBar page={page} pages={pages} />

      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center pt-20 pb-28 px-2 md:pb-12 md:pt-8">
        <div className="mb-6 flex w-full max-w-[900px] justify-between text-[.7rem] font-semibold uppercase tracking-[.14em] text-white/40 px-2">
          <span>{book.categoryName ?? "Library"}</span>
          <span>
            {Math.round((page / pages) * 100)}% · Page {page} of {pages}
          </span>
        </div>

        {/* PDF Reader Canvas / Viewport */}
        <div
          className="w-full max-w-[900px] rounded-sm overflow-hidden shadow-2xl transition-transform duration-200 border border-white/10"
          style={{
            transform: isMobile ? "scale(1)" : `scale(${zoom})`,
            transformOrigin: "top center",
          }}
        >
          {securePdfUrl ? (
            <iframe
              src={securePdfUrl}
              title={`Reading ${book.title}`}
              className="h-[80vh] md:h-[820px] w-full bg-white border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : isLoadingPdf ? (
            <div
              className={`h-[80vh] md:h-[820px] flex items-center justify-center ${paperClass} animate-pulse`}
            >
              <div className="text-center p-8">
                <BookOpen size={28} className="mx-auto mb-4 text-amethyst animate-bounce" />
                <div className="text-sm font-semibold text-current/80 mb-2">
                  Preparing your book…
                </div>
                <div className="text-xs text-current/50">
                  Verifying authenticated access
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`h-[80vh] md:h-[820px] flex items-center justify-center ${paperClass}`}
            >
              <div className="text-center p-8">
                <BookOpen size={32} className="mx-auto mb-4 opacity-40" />
                <h3 className="font-display text-2xl mb-2">PDF Pending</h3>
                <p className="text-sm text-current/60 max-w-sm">
                  This book has been registered, but its PDF document is being processed by the library admin.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[.66rem] font-semibold uppercase tracking-[.14em] text-white/30">
          <span>{book.title}</span>
          <span className="mx-2">·</span>
          <span>{book.authorName}</span>
        </div>
      </main>

      {!isMobile ? (
        <ReaderControlsDesktop
          page={page}
          pages={pages}
          zoom={zoom}
          onPageChange={onPageChange}
          onZoomChange={onZoomChange}
          onBookmark={onBookmark}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      ) : (
        <ReaderControlsMobile
          page={page}
          pages={pages}
          onPageChange={onPageChange}
          onBookmark={onBookmark}
        />
      )}
    </div>
  );
}
