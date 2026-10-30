'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
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

/**
 * Visor página a página con barra de progreso.
 * Sin descarga ni enlace al original. Los enlaces del PDF sí son clicables.
 */
export function GuidePdfViewer({ slug, title, canAccess }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PdfDoc | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [page, setPage] = useState(1);
  const [rendering, setRendering] = useState(false);
  const [links, setLinks] = useState<PdfPageLink[]>([]);
  const [viewportSize, setViewportSize] = useState({ width: 1, height: 1 });

  const renderPage = useCallback(async (pageNum: number) => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;

    setRendering(true);
    try {
      const pdfPage = await pdf.getPage(pageNum);
      const base = pdfPage.getViewport({ scale: 1 });
      const maxWidth = Math.min(920, canvas.parentElement?.clientWidth || 920);
      const scale = Math.max(1, maxWidth / base.width);
      const viewport = pdfPage.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.setAttribute('aria-label', `${title} · página ${pageNum} de ${pdf.numPages}`);
      const context = canvas.getContext('2d');
      if (!context) return;
      await pdfPage.render({ canvasContext: context, viewport, canvas }).promise;
      setViewportSize({ width: viewport.width, height: viewport.height });
      setLinks(await collectPdfPageLinks(pdf, pdfPage, scale));
    } finally {
      setRendering(false);
    }
  }, [title]);

  useEffect(() => {
    if (!canAccess || !slug) return;
    // Criterio técnico de inicio de suministro: primera carga del visor con acceso.
    // No prueba lectura completa.
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
        setPage(1);
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
    if (!canAccess || loading || error || pageCount < 1) return;
    void renderPage(page);
  }, [canAccess, loading, error, pageCount, page, renderPage]);

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

  return (
    <div
      className="space-y-4"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {loading ? <p className="text-sm text-[var(--ink-soft)]">Cargando la guía…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {!loading && !error && pageCount > 0 ? (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <p className="font-semibold text-[var(--ink)]">
                Página {page} de {pageCount}
              </p>
              <p className="tabular-nums text-[var(--ink-soft)]">{progress}% completado</p>
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

          <div className="overflow-hidden rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-2 sm:p-3">
            <div className="relative mx-auto w-fit max-w-full">
              <canvas
                ref={canvasRef}
                className={`block max-w-full select-none bg-white shadow-sm ${rendering ? 'opacity-70' : ''}`}
                draggable={false}
                style={{ WebkitUserSelect: 'none', userSelect: 'none', height: 'auto' }}
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
        </>
      ) : null}
    </div>
  );
}
