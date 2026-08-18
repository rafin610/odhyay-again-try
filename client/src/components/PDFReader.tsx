/* ODHYAY style: Premium In-App PDF Reader — canvas-based via pdf.js, no iframe/embed.
   Renders PDF pages onto HTML5 Canvas elements inside the app. */
import { useState, useEffect, useRef, useCallback } from "react";
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
  Loader2,
  AlertCircle,
  Download,
  Trash,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";

// Point pdf.js worker to the matching CDN build
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  showDownload?: boolean;
  showPrint?: boolean;
}

/* ─── Header ────────────────────────────────────────────────────────────── */
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

/* ─── Desktop Controls ──────────────────────────────────────────────────── */
function ReaderControlsDesktop({
  page,
  pages,
  zoom,
  onPageChange,
  onZoomChange,
  onBookmark,
  onFullscreen,
  isFullscreen,
  showDownload,
  showPrint,
}: {
  page: number;
  pages: number;
  zoom: number;
  onPageChange: (p: number) => void;
  onZoomChange: (z: number) => void;
  onBookmark: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  showDownload?: boolean;
  showPrint?: boolean;
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
        onClick={() => onZoomChange(Math.max(0.5, zoom - 0.1))}
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
        onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
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

      {showDownload && (
        <button
          className="focus-ring p-2 rounded text-[#d7cedb] transition hover:bg-[#2a2430]"
          aria-label="Download PDF"
          title="Download PDF"
        >
          <Download size={16} />
        </button>
      )}

      {showPrint && (
        <button
          className="focus-ring p-2 rounded text-[#d7cedb] transition hover:bg-[#2a2430]"
          aria-label="Print PDF"
          title="Print PDF"
        >
          <Trash size={16} />  {/* Using Trash as placeholder for print icon; can swap if needed */}
        </button>
      )}
    </div>
  );
}

/* ─── Mobile Controls ───────────────────────────────────────────────────── */
function ReaderControlsMobile({
  page,
  pages,
  onPageChange,
  onBookmark,
  showDownload,
}: {
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
  onBookmark: () => void;
  showDownload?: boolean;
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

      {showDownload && (
        <button
          className="focus-ring rounded-lg bg-[#2a2430] p-3 text-[#d7cedb] transition active:scale-95 disabled:opacity-30"
          aria-label="Download"
          title="Download"
        >
          <Download size={18} />
        </button>
      )}
    </div>
  );
}

/* ─── Progress Bar ──────────────────────────────────────────────────────── */
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

/* ─── Canvas PDF Page Renderer ──────────────────────────────────────────── */
function PdfCanvasPage({
  pdfDoc,
  pageNumber,
  scale,
  theme,
}: {
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  theme: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [rendering, setRendering] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const canvas = canvasRef.current;
      if (!canvas || !pdfDoc) return;

      // Cancel any previous in-flight render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* already done */ }
      }

      setRendering(true);

      try {
        const pdfPage = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = pdfPage.getViewport({ scale: scale * window.devicePixelRatio });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
        canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const task = pdfPage.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;

        await task.promise;
        if (!cancelled) setRendering(false);
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException" && !cancelled) {
          console.error("PDF render error for page", pageNumber, err);
          setRendering(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch { /* noop */ }
      }
    };
  }, [pdfDoc, pageNumber, scale]);

  // Apply a CSS filter for sepia / daylight themes
  const filterStyle =
    theme === "sepia"
      ? "sepia(0.35) brightness(0.92)"
      : theme === "daylight"
      ? "brightness(1.02)"
      : "none";

  return (
    <div className="relative">
      {rendering && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#211e25]/60 z-10">
          <Loader2 size={24} className="animate-spin text-amethyst" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="block mx-auto rounded-sm"
        style={{ filter: filterStyle }}
      />
    </div>
  );
}

/* ─── Main PDFReader ────────────────────────────────────────────────────── */
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
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [actualPageCount, setActualPageCount] = useState(pages);

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load PDF document via pdf.js when URL is available
  useEffect(() => {
    if (!pdfUrl) {
      setPdfDoc(null);
      return;
    }

    let cancelled = false;
    setPdfLoading(true);
    setPdfError(null);

    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      // Disable range requests to avoid CORS issues with signed URLs
      disableRange: true,
      disableStream: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (!cancelled) {
          setPdfDoc(doc);
          setActualPageCount(doc.numPages);
          setPdfLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("PDF load error:", err);
          setPdfError(
            err?.message?.includes("Missing PDF")
              ? "This PDF file could not be found. Please contact the library admin."
              : err?.message?.includes("password")
              ? "This PDF is password-protected and cannot be opened."
              : "Failed to load the PDF document. Please try again."
          );
          setPdfLoading(false);
        }
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [pdfUrl]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        onPageChange(Math.max(1, page - 1));
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        onPageChange(Math.min(totalPages, page + 1));
      } else if (e.key === "-") {
        onZoomChange(Math.max(0.5, zoom - 0.1));
      } else if (e.key === "+" || e.key === "=") {
        onZoomChange(Math.min(2.0, zoom + 0.1));
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [page, zoom, onPageChange, onZoomChange]);

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

  const totalPages = actualPageCount || pages;
  const isDocReady = pdfDoc !== null;
  const isLoading = isLoadingPdf || pdfLoading;

  return (
    <div
      className={`min-h-screen ${themeClass} transition-colors duration-300 select-none`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReaderHeader book={book} theme={theme} onTheme={onThemeChange} />
      <ProgressBar page={page} pages={totalPages} />

      <main className="flex min-h-[calc(100vh-64px)] flex-col items-center pt-20 pb-28 px-2 md:pb-12 md:pt-8">
        <div className="mb-6 flex w-full max-w-[900px] justify-between text-[.7rem] font-semibold uppercase tracking-[.14em] text-white/40 px-2">
          <span>{book.categoryName ?? "Library"}</span>
          <span>
            {Math.round((page / totalPages) * 100)}% · Page {page} of{" "}
            {totalPages}
          </span>
        </div>

        {/* PDF Canvas Viewport */}
        <div
          className="w-full max-w-[900px] rounded-sm overflow-hidden shadow-2xl border border-white/10"
          style={{
            transform: isMobile ? "scale(1)" : undefined,
            transformOrigin: "top center",
          }}
        >
          {isDocReady ? (
            /* ── Canvas-rendered PDF page ── */
            <PdfCanvasPage
              pdfDoc={pdfDoc}
              pageNumber={Math.min(page, totalPages)}
              scale={isMobile ? 1.0 : zoom}
              theme={theme}
            />
          ) : isLoading ? (
            /* ── Loading state ── */
            <div
              className={`h-[80vh] md:h-[820px] flex items-center justify-center ${paperClass}`}
            >
              <div className="text-center p-8">
                <Loader2
                  size={32}
                  className="mx-auto mb-4 text-amethyst animate-spin"
                />
                <div className="text-sm font-semibold mb-2" style={{ color: "inherit" }}>
                  Loading your book…
                </div>
                <div className="text-xs opacity-50">
                  Fetching and rendering PDF
                </div>
              </div>
            </div>
          ) : pdfError ? (
            /* ── Error state ── */
            <div
              className={`h-[80vh] md:h-[820px] flex items-center justify-center ${paperClass}`}
            >
              <div className="text-center p-8 max-w-sm">
                <AlertCircle
                  size={32}
                  className="mx-auto mb-4 text-red-400"
                />
                <h3 className="font-display text-xl mb-2">
                  Unable to load PDF
                </h3>
                <p className="text-sm opacity-60 mb-6">{pdfError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary text-xs"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            /* ── No PDF available ── */
            <div
              className={`h-[80vh] md:h-[820px] flex items-center justify-center ${paperClass}`}
            >
              <div className="text-center p-8">
                <BookOpen size={32} className="mx-auto mb-4 opacity-40" />
                <h3 className="font-display text-2xl mb-2">PDF Pending</h3>
                <p className="text-sm opacity-60 max-w-sm">
                  This book has been registered, but its PDF document is being
                  processed by the library admin.
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
          pages={totalPages}
          zoom={zoom}
          onPageChange={onPageChange}
          onZoomChange={onZoomChange}
          onBookmark={onBookmark}
          onFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          showDownload={false}
          showPrint={false}
        />
      ) : (
        <ReaderControlsMobile
          page={page}
          pages={totalPages}
          onPageChange={onPageChange}
          onBookmark={onBookmark}
          showDownload={false}
        />
      )}
    </div>
  );
}
