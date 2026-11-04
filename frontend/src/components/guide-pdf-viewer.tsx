'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { usePdfFullscreen } from '@/hooks/use-pdf-fullscreen';
import {
  clampGuidePage,
  readGuideLastPage,
  writeGuideLastPage,
} from '@/lib/guide-reading-position';
import { collectPdfPageLinks, type PdfPageLink } from '@/lib/pdf-page-links';

type Props = {
  slug: string;
  title: string;
  canAccess: boolean;
};

type PdfPage = {
  getViewport: (opts: { scale: number }) => {
    width: number;
    height: number;
    convertToViewportPoint: (x: number, y: number) => number[];
  };
  getAnnotations: (opts?: { intent?: string }) => Promise<unknown[]>;
  render: (opts: {
    canvasContext: CanvasRenderingContext2D;
    viewport: { width: number; height: number };
    canvas: HTMLCanvasElement;
  }) => { promise: Promise<void> };
};

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  getDestination?: (name: string) => Promise<unknown>;
  getPageIndex?: (ref: unknown) => Promise<number>;
};

const ZOOM_STEP = 0.15;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

/**
 * Visor página a página con barra de progreso, zoom y pantalla completa.
 * Sin descarga ni enlace al original. Los enlaces del PDF sí son clicables.
 * Restaura la última página vista (no el máximo alcanzado).
 */
export function GuidePdfViewer({ slug, title, canAccess }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PdfDoc | null>(null);
  const restoredRef = useRef(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rendering, setRendering] = useState(false);
  const [links, setLinks] = useState<PdfPageLink[]>([]);
  const [viewportSize, setViewportSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const { fullscreen, enter, exit, toggle } = usePdfFullscreen();

  const renderPage = useCallback(
    async (pageNum: number) => {
      const pdf = pdfRef.current;
      const canvas = canvasRef.current;
      if (!pdf || !canvas || !containerWidth) return;

      setRendering(true);
      try {
        const pdfPage = await pdf.getPage(pageNum);
        const base = pdfPage.getViewport({ scale: 1 });
        const fitScale = Math.max(0.2, (containerWidth - 8) / base.width);
        const cssScale = fitScale * zoom;
        const pixelRatio = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);
        const cssViewport = pdfPage.getViewport({ scale: cssScale });
        const renderViewport = pdfPage.getViewport({ scale: cssScale * pixelRatio });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;
        canvas.setAttribute('aria-label', `${title} · página ${pageNum} de ${pdf.numPages}`);
        const context = canvas.getContext('2d');
        if (!context) return;
        await pdfPage.render({ canvasContext: context, viewport: renderViewport, canvas }).promise;
        setViewportSize({ width: cssViewport.width, height: cssViewport.height });
        setLinks(await collectPdfPageLinks(pdf, pdfPage, cssScale));
      } finally {
        setRendering(false);
      }
    },
    [containerWidth, title, zoom],
  );

  useEffect(() => {
    if (!canAccess || !slug) return;
    void api
      .recordContentSupplyStart({
        courseSlug: slug,
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      })
      .catch(() => undefined);
  }, [canAccess, slug]);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    restoredRef.current = false;

    (async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const response = await fetch(`/api/backend/courses/${encodeURIComponent(slug)}/guide-pdf`, {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(
            response.status === 403
              ? 'No tienes acceso a esta guía.'
              : 'No se pudo cargar la guía.',
          );
        }
        const data = await response.arrayBuffer();
        if (cancelled) return;

        const pdf = (await pdfjs.getDocument({ data }).promise) as unknown as PdfDoc;
        pdfRef.current = pdf;
        setPageCount(pdf.numPages);

        const saved = readGuideLastPage(slug);
        const startPage = saved ? clampGuidePage(saved, pdf.numPages) : 1;
        setPage(startPage);
        restoredRef.current = true;
        setError('');
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo mostrar la guía.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current = null;
    };
  }, [slug, canAccess]);

  useEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    const measure = () => setContainerWidth(node.clientWidth || 0);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [fullscreen, loading, error, pageCount]);

  useEffect(() => {
    if (!canAccess || loading || error || pageCount < 1 || !containerWidth) return;
    void renderPage(page);
  }, [canAccess, loading, error, pageCount, page, renderPage, containerWidth]);

  useEffect(() => {
    if (!canAccess || loading || error || pageCount < 1 || !restoredRef.current) return;
    writeGuideLastPage(slug, page);
  }, [canAccess, loading, error, pageCount, page, slug]);

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5">
        <p className="text-sm font-semibold text-[var(--ink)]">Contenido bloqueado</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Activa el acceso para leer esta guía página a página.
        </p>
      </div>
    );
  }

  const progress = pageCount > 0 ? Math.round((page / pageCount) * 100) : 0;
  const zoomControls = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
        disabled={loading || zoom <= ZOOM_MIN}
        className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] disabled:opacity-40"
        aria-label="Alejar"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => setZoom(1)}
        disabled={loading}
        className="min-w-[3.5rem] rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-bold tabular-nums text-[var(--ink)] disabled:opacity-40"
        aria-label="Ajustar al ancho"
      >
        {Math.round(zoom * 100)}%
      </button>
      <button
        type="button"
        onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
        disabled={loading || zoom >= ZOOM_MAX}
        className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] disabled:opacity-40"
        aria-label="Acercar"
      >
        +
      </button>
    </div>
  );

  const navButtons = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        disabled={page <= 1 || rendering}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Anterior
      </button>
      <button
        type="button"
        disabled={page >= pageCount || rendering}
        onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
        className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--green-900)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Siguiente →
      </button>
    </div>
  );

  return (
    <div
      className={`space-y-4${fullscreen ? ' pdf-viewer--fullscreen pdf-viewer--guide' : ''}`}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      aria-modal={fullscreen || undefined}
    >
      {loading ? <p className="text-sm text-[var(--ink-soft)]">Cargando la guía…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading && !error && pageCount > 0 ? (
        <>
          {fullscreen ? (
            <div className="pdf-viewer__fs-bar">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-700)]">
                  Guía
                </p>
                <p className="truncate text-sm font-semibold text-[var(--ink)]">{title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {zoomControls}
                <button
                  type="button"
                  onClick={exit}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white"
                >
                  Salir
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-semibold text-[var(--ink)]">
                  Página {page} de {pageCount}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="tabular-nums text-[var(--ink-soft)]">{progress}% completado</p>
                  {zoomControls}
                  <button
                    type="button"
                    onClick={toggle}
                    className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
                  >
                    Pantalla completa
                  </button>
                </div>
              </div>
              <div
                className="h-2 overflow-hidden rounded-full bg-[var(--bg-app)]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                aria-label="Progreso de lectura"
              >
                <div
                  className="h-full rounded-full bg-[var(--green-700)] transition-[width] duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div
            ref={stageRef}
            className={`overflow-auto rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-2 sm:p-3${
              fullscreen ? ' pdf-viewer__stage pdf-viewer__stage--fullscreen border-0' : ''
            }`}
          >
            <div className="relative mx-auto w-fit max-w-full">
              <canvas
                ref={canvasRef}
                className={`block max-w-none select-none bg-white shadow-sm ${rendering ? 'opacity-70' : ''}`}
                draggable={false}
                style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
              />
              {links.length > 0 ? (
                <div className="absolute inset-0">
                  {links.map((link) => {
                    const style = {
                      left: `${(link.left / viewportSize.width) * 100}%`,
                      top: `${(link.top / viewportSize.height) * 100}%`,
                      width: `${(link.width / viewportSize.width) * 100}%`,
                      height: `${(link.height / viewportSize.height) * 100}%`,
                    };
                    if (link.url) {
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute rounded-sm hover:bg-[rgba(22,112,85,0.12)]"
                          style={style}
                          aria-label="Abrir enlace de la guía"
                        />
                      );
                    }
                    return (
                      <button
                        key={link.id}
                        type="button"
                        className="absolute rounded-sm hover:bg-[rgba(22,112,85,0.12)]"
                        style={style}
                        aria-label={`Ir a la página ${link.pageNumber}`}
                        onClick={() => {
                          if (link.pageNumber) setPage(link.pageNumber);
                        }}
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>

          {fullscreen ? (
            <div className="pdf-viewer__fs-nav" role="group" aria-label="Navegación de páginas">
              <button
                type="button"
                disabled={page <= 1 || rendering}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] disabled:opacity-40"
              >
                ← Anterior
              </button>
              <p className="text-sm font-semibold text-[var(--ink)]" aria-live="polite">
                {page} / {pageCount} · {progress}%
              </p>
              <button
                type="button"
                disabled={page >= pageCount || rendering}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Siguiente →
              </button>
            </div>
          ) : (
            <>
              {navButtons}
              <button
                type="button"
                onClick={enter}
                className="w-full rounded-full bg-[var(--green-700)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--green-900)]"
              >
                Ver en pantalla completa
              </button>
            </>
          )}
        </>
      ) : (
        <div ref={stageRef} className="h-1 w-full" aria-hidden="true" />
      )}
    </div>
  );
}
