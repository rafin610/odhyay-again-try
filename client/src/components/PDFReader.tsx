/* ODHYAY style: Premium PDF Reading Environment — calm, immersive, focused on the text. Desktop + Mobile optimized. */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Bookmark, Minus, Plus, Sparkles, X, Menu } from "lucide-react";

interface PDFReaderProps {
  book: { id: number; slug: string; title: string; categoryName: string | null; authorName: string; pageCount: number };
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

// Desktop Reader Header
function ReaderHeader({ book, theme, onTheme, onClose }: { book: PDFReaderProps['book']; theme: string; onTheme: (theme: string) => void; onClose: () => void }) {
  const themeLabel = theme === "dark" ? "Night" : theme === "daylight" ? "Daylight" : "Sepia";
  
  return <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#111015]/95 px-6 backdrop-blur-md md:px-8">
    <Link href={`/book/${book.slug}`} className="focus-ring flex items-center gap-3 text-sm font-semibold text-[#c1bac5] transition hover:text-[#f3eee6]">
      <ArrowLeft size={18} />
      <span className="hidden sm:inline">Back to book</span>
    </Link>
    
    <div className="flex items-center gap-2 flex-1 ml-6">
      <h1 className="font-display text-sm tracking-[.12em] text-[#f3eee6] line-clamp-1 flex-1">
        {book.title}
      </h1>
    </div>
    
    <div className="flex items-center gap-4 text-xs text-[#8f8996]">
      <button 
        onClick={() => onTheme(theme === "dark" ? "daylight" : theme === "daylight" ? "sepia" : "dark")} 
        className="focus-ring rounded-sm p-2 text-[#d7cedb] transition hover:bg-[#2a2430]" 
        title={`Change theme (Current: ${themeLabel})`}
        aria-label={`Change theme - currently ${themeLabel}`}
      >
        <Sparkles size={16} />
      </button>
      <span className="hidden sm:inline text-[#5a5163]">·</span>
      <span className="hidden sm:inline text-[#8f8996]">{themeLabel}</span>
    </div>
  </header>;
}

// Desktop Reader Controls - Fixed Bottom Bar
function ReaderControlsDesktop({ page, pages, zoom, onPageChange, onZoomChange, onBookmark }: { page: number; pages: number; zoom: number; onPageChange: (p: number) => void; onZoomChange: (z: number) => void; onBookmark: () => void }) {
  return <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-3 rounded-lg border border-[#3d3547] bg-[#17141c]/98 px-4 py-3 backdrop-blur-lg text-[#d7cedb]">
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
        onChange={(e) => onPageChange(Math.min(pages, Math.max(1, Number(e.target.value) || 1)))}
        className="w-8 bg-transparent text-center text-sm font-semibold outline-none text-[#d7cedb]" 
        aria-label="Current page"
        title={`Page ${page} of ${pages}`}
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
      onClick={() => onZoomChange(Math.max(0.8, zoom - 0.1))}
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
      className="focus-ring p-2 rounded text-[#b7a4d7] transition hover:bg-[#2a2430]" 
      onClick={onBookmark}
      aria-label="Add bookmark"
      title="Bookmark this page"
    >
      <Bookmark size={16} />
    </button>
  </div>;
}

// Mobile Reader Controls - Bottom Bar with Touch-friendly UI
function ReaderControlsMobile({ page, pages, onPageChange, onPrevPage, onNextPage }: { page: number; pages: number; onPageChange: (p: number) => void; onPrevPage: () => void; onNextPage: () => void }) {
  return <div className="fixed inset-x-0 bottom-0 z-40 flex h-20 items-end justify-between gap-2 bg-gradient-to-t from-[#111015]/98 via-[#111015]/90 to-transparent px-4 py-4 backdrop-blur-sm">
    <button 
      onClick={onPrevPage} 
      className="focus-ring rounded-lg bg-[#2a2430] p-3 text-[#d7cedb] transition active:scale-95 flex-1 flex justify-center"
      aria-label="Previous page"
      title="Swipe right or tap ← for previous page"
    >
      <ArrowLeft size={20} />
    </button>

    <div className="flex flex-col items-center gap-1 px-2">
      <span className="text-xs text-[#8f8996]">Page</span>
      <input 
        value={page} 
        onChange={(e) => onPageChange(Math.min(pages, Math.max(1, Number(e.target.value) || 1)))}
        className="w-12 bg-[#2a2430] text-center text-sm font-semibold text-[#d7cedb] rounded outline-none p-2" 
        aria-label="Current page"
      />
      <span className="text-xs text-[#8f8996]">of {pages}</span>
    </div>

    <button 
      onClick={onNextPage} 
      className="focus-ring rounded-lg bg-[#2a2430] p-3 text-[#d7cedb] transition active:scale-95 flex-1 flex justify-center"
      aria-label="Next page"
      title="Swipe left or tap → for next page"
    >
      <ArrowRight size={20} />
    </button>
  </div>;
}

// Reading Progress Indicator
function ProgressBar({ page, pages }: { page: number; pages: number }) {
  const percentage = (page / pages) * 100;
  return <div className="fixed top-16 left-0 right-0 z-30 h-1 bg-[#1a171f]">
    <div 
      className="h-full bg-gradient-to-r from-[#b7a4d7] to-[#9b8fc7] transition-all duration-300"
      style={{ width: `${percentage}%` }}
      role="progressbar"
      aria-valuenow={page}
      aria-valuemin={1}
      aria-valuemax={pages}
    />
  </div>;
}

// Main PDF Reader Component
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
  isLoadingPdf 
}: PDFReaderProps) {
  const [showMobileControls, setShowMobileControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPageChange(Math.max(1, page - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onPageChange(Math.min(pages, page + 1));
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        onZoomChange(Math.min(1.5, zoom + 0.1));
      } else if (e.key === '-') {
        e.preventDefault();
        onZoomChange(Math.max(0.8, zoom - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [page, zoom, pages, onPageChange, onZoomChange]);

  // Auto-hide mobile controls on mobile (tap to show)
  const handleMobileContentTap = () => {
    if (isMobile) {
      setShowMobileControls(!showMobileControls);
    }
  };

  // Theme-based styling
  const themeClass = theme === "sepia" 
    ? "bg-[#3b3026]" 
    : theme === "daylight" 
      ? "bg-[#d9d0bd]" 
      : "bg-[#111015]";

  const paperClass = theme === "sepia"
    ? "bg-[#e1cfaa] text-[#483d32]"
    : theme === "daylight"
      ? "bg-[#eee8da] text-[#413c38]"
      : "bg-[#211e25] text-[#d9d2d8]";

  return <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
    {/* Header */}
    <ReaderHeader 
      book={book} 
      theme={theme} 
      onTheme={onThemeChange}
      onClose={() => {}}
    />

    {/* Progress Bar */}
    <ProgressBar page={page} pages={pages} />

    {/* Main Reading Area */}
    <main 
      className="flex min-h-[calc(100vh-64px)] flex-col items-center pt-20 pb-28 px-4 md:pb-8 md:pt-8"
      onClick={handleMobileContentTap}
    >
      {/* Metadata */}
      <div className="mb-8 flex w-full max-w-[900px] justify-between text-xs font-semibold uppercase tracking-[.14em] text-white/40">
        <span>{book.categoryName ?? "Library"}</span>
        <span>{Math.round((page / pages) * 100)}% · Page {page} of {pages}</span>
      </div>

      {/* PDF Viewer Container */}
      <div className={`w-full max-w-[900px] rounded-lg overflow-hidden shadow-2xl transition-transform duration-200`} style={{ transform: isMobile ? 'scale(1)' : `scale(${zoom})`, transformOrigin: 'top center' }}>
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={`Reading ${book.title}`}
            className="h-screen md:h-[800px] w-full bg-white"
            frameBorder="0"
          />
        ) : isLoadingPdf ? (
          <div className={`h-screen md:h-[800px] flex items-center justify-center ${paperClass} animate-pulse`}>
            <div className="text-center">
              <div className="text-sm font-semibold text-current/60 mb-2">Loading your PDF…</div>
              <div className="text-xs text-current/40">Please wait while we prepare your book</div>
            </div>
          </div>
        ) : (
          <div className={`h-screen md:h-[800px] flex items-center justify-center ${paperClass}`}>
            <div className="text-center">
              <h2 className="font-display text-2xl mb-2">No PDF available</h2>
              <p className="text-sm text-current/60">This book doesn't have a PDF attached yet.</p>
            </div>
          </div>
        )}
      </div>

      {/* Reading Metadata Footer */}
      <div className="mt-8 w-full max-w-[900px] text-center">
        <div className="text-xs font-semibold uppercase tracking-[.14em] text-white/30">
          <span>{book.title}</span>
          <span className="mx-2">·</span>
          <span>{book.authorName}</span>
        </div>
      </div>
    </main>

    {/* Bottom Controls - Desktop */}
    {!isMobile && <ReaderControlsDesktop 
      page={page} 
      pages={pages} 
      zoom={zoom} 
      onPageChange={onPageChange} 
      onZoomChange={onZoomChange}
      onBookmark={onBookmark}
    />}

    {/* Bottom Controls - Mobile */}
    {isMobile && showMobileControls && <ReaderControlsMobile
      page={page}
      pages={pages}
      onPageChange={onPageChange}
      onPrevPage={() => onPageChange(Math.max(1, page - 1))}
      onNextPage={() => onPageChange(Math.min(pages, page + 1))}
    />}

    {/* Mobile hint for tap-to-show controls */}
    {isMobile && !showMobileControls && <div className="fixed inset-0 z-20 cursor-pointer" onClick={handleMobileContentTap} />}
  </div>;
}
