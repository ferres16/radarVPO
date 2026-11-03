'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist';
import { usePdfFullscreen } from '@/hooks/use-pdf-fullscreen';
import { trackEvent } from '@/lib/analytics';
import {
  buildPdfProxyPath,
  categoryLabel,
  clampPage,
  clampZoom,
  type ViewableDocument,
} from '@/lib/promotion-documents';

type ViewerStatus = 'loading' | 'ready' | 'error';
type PdfJs = typeof import('pdfjs-dist');

const ZOOM_STEP = 0.25;

let pdfJsPromise: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  if (!pdfJsPromise) {
    pdfJsPromise = import('pdfjs-dist/legacy/build/pdf.mjs').then((module) => {
      module.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      return module as unknown as PdfJs;
    });
    pdfJsPromise.catch(() => {
      pdfJsPromise = null;
    });
  }
  return pdfJsPromise;
}

const navButton =
  'rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)] disabled:cursor-not-allowed disabled:opacity-40';
const primaryNavButton =
  'rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--green-900)] disabled:cursor-not-allowed disabled:opacity-40';
const compactButton =
  'rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)] disabled:cursor-not-allowed disabled:opacity-40';

export function PromotionPdfViewer({
  promotionId,
  documents,
  sourceUrl,
}: {
  promotionId: string;
  documents: ViewableDocument[];
  sourceUrl: string;
}) {
  const [activeId, setActiveId] = useState(documents[0]?.id ?? '');
  const [status, setStatus] = useState<ViewerStatus>('loading');
  const [progress, setProgress] = useState<number | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const { fullscreen, enter, exit, toggle } = usePdfFullscreen();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const active = documents.find((item) => item.id === activeId) ?? documents[0];
  const proxyUrl = active ? buildPdfProxyPath(promotionId, active.id) : '';
  const downloadUrl = active ? buildPdfProxyPath(promotionId, active.id, { download: true }) : '';

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => {
      const style = window.getComputedStyle(element);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      setContainerWidth(Math.max(0, Math.floor(element.clientWidth - padding)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [fullscreen]);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    setStatus('loading');
    setProgress(null);
    setNumPages(0);
    setPage(1);
    setZoom(1);
    pdfRef.current = null;
    trackEvent('pdf_viewer_opened', { promotionId, documentId: active.id });

    (async () => {
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;
        loadingTask = pdfjs.getDocument({ url: proxyUrl });
        loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (!cancelled && total > 0) setProgress(Math.min(1, loaded / total));
        };
        const pdf = await loadingTask.promise;
        if (cancelled) {
          void pdf.loadingTask.destroy();
          return;
        }
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setStatus('ready');
        trackEvent('pdf_viewer_loaded', {
          promotionId,
          documentId: active.id,
          pages: pdf.numPages,
        });
      } catch (error) {
        if (cancelled) return;
        setStatus('error');
        trackEvent('pdf_viewer_error', {
          promotionId,
          documentId: active.id,
          reason: error instanceof Error ? error.name : 'unknown',
        });
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      void loadingTask?.destroy();
      pdfRef.current = null;
    };
  }, [active, promotionId, proxyUrl, reloadKey]);

  useEffect(() => {
    if (status !== 'ready' || !containerWidth) return;
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas) return;
    let cancelled = false;

    (async () => {
      try {
        const pdfPage = await pdf.getPage(clampPage(page, pdf.numPages));
        if (cancelled) return;
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const fitScale = Math.max(0.2, (containerWidth - 2) / baseViewport.width);
        const cssViewport = pdfPage.getViewport({ scale: fitScale * zoom });
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const renderViewport = pdfPage.getViewport({ scale: fitScale * zoom * pixelRatio });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);
        canvas.style.width = `${Math.floor(cssViewport.width)}px`;
        canvas.style.height = `${Math.floor(cssViewport.height)}px`;

        renderTaskRef.current?.cancel();
        const task = pdfPage.render({ canvas, viewport: renderViewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch (error) {
        const name = error instanceof Error ? error.name : '';
        if (cancelled || name === 'RenderingCancelledException') return;
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
    };
  }, [status, page, zoom, containerWidth]);

  const goToPage = useCallback(
    (next: number) => setPage(clampPage(next, numPages)),
    [numPages],
  );

  const selectDocument = (id: string) => {
    if (id === activeId) return;
    setActiveId(id);
    setZoom(1);
    trackEvent('pdf_document_selected', { promotionId, documentId: id });
  };

  if (!active) return null;

  const loading = status === 'loading';
  const ready = status === 'ready';
  const pageProgress = numPages > 0 ? Math.round((page / numPages) * 100) : 0;

  const navButtons = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        type="button"
        className={navButton}
        onClick={() => goToPage(page - 1)}
        disabled={!ready || page <= 1}
      >
        ← Anterior
      </button>
      <button
        type="button"
        className={primaryNavButton}
        onClick={() => goToPage(page + 1)}
        disabled={!ready || page >= numPages}
      >
        Siguiente →
      </button>
    </div>
  );

  return (
    <section
      aria-label="Documento oficial de la promoción"
      aria-modal={fullscreen || undefined}
      className={`premium-card overflow-hidden p-0${fullscreen ? ' pdf-viewer--fullscreen' : ''}`}
    >
      {fullscreen ? (
        <div className="pdf-viewer__fs-bar">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-700)]">
              {categoryLabel(active.category)}
            </p>
            <p className="truncate text-sm font-semibold text-[var(--ink)]">{active.label}</p>
          </div>
          <button type="button" className={primaryNavButton} onClick={exit}>
            Salir
          </button>
        </div>
      ) : (
        <div className="space-y-3 border-b border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-3 md:px-5">
          {documents.length > 1 ? (
            <div>
              <label
                htmlFor="pdf-document-select"
                className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]"
              >
                Documento ({documents.length})
              </label>
              <select
                id="pdf-document-select"
                value={active.id}
                onChange={(event) => selectDocument(event.target.value)}
                className="mt-2 block min-h-11 w-full rounded-xl border border-[var(--stroke)] bg-white px-3 text-sm font-semibold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
              >
                {documents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {categoryLabel(item.category)} · {item.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
                {categoryLabel(active.category)}
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-[var(--ink)]">{active.label}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <p className="font-semibold text-[var(--ink)]">
              Página {page} de {numPages || '–'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <p className="tabular-nums text-[var(--ink-soft)]">{pageProgress}%</p>
              <button
                type="button"
                onClick={() => {
                  toggle();
                  trackEvent('pdf_fullscreen_toggled', {
                    promotionId,
                    documentId: active.id,
                    fullscreen: !fullscreen,
                  });
                }}
                className={`${compactButton} md:hidden`}
              >
                Pantalla completa
              </button>
              <div className="hidden items-center gap-1 md:flex">
                <button
                  type="button"
                  className={compactButton}
                  onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
                  disabled={!ready || zoom <= 0.5}
                  aria-label="Alejar"
                >
                  −
                </button>
                <button
                  type="button"
                  className={compactButton}
                  onClick={() => setZoom(1)}
                  disabled={!ready}
                  aria-label="Ajustar al ancho"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  className={compactButton}
                  onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
                  disabled={!ready || zoom >= 3}
                  aria-label="Acercar"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-white"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pageProgress}
            aria-label="Progreso del documento"
          >
            <div
              className="h-full rounded-full bg-[var(--green-700)] transition-[width] duration-300 ease-out"
              style={{ width: `${pageProgress}%` }}
            />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className={`pdf-viewer__stage${fullscreen ? ' pdf-viewer__stage--fullscreen' : ''}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (!ready) return;
          if (event.key === 'ArrowRight' || event.key === 'PageDown') {
            event.preventDefault();
            goToPage(page + 1);
          } else if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
            event.preventDefault();
            goToPage(page - 1);
          }
        }}
      >
        {loading ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center" role="status">
            <span
              className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--stroke)] border-t-[var(--green-700)]"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-[var(--ink)]">Cargando el documento oficial…</p>
            {progress !== null ? (
              <p className="text-xs text-[var(--ink-soft)]">{Math.round(progress * 100)}%</p>
            ) : null}
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 p-6 text-center" role="alert">
            <p className="text-base font-bold text-[var(--ink)]">No hemos podido mostrar este documento aquí</p>
            <p className="text-sm leading-6 text-[var(--ink-soft)]">
              El origen no responde o no permite incrustarlo. Puedes abrirlo directamente en su web oficial o volver a
              intentarlo.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href={active.originalUrl} target="_blank" rel="noopener noreferrer" className={navButton}>
                Abrir el original
              </a>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={navButton}>
                Ver fuente oficial
              </a>
              <button type="button" className={navButton} onClick={() => setReloadKey((value) => value + 1)}>
                Reintentar
              </button>
            </div>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          aria-label={`Página ${page} de ${numPages || '…'} de ${active.label}`}
          className={`mx-auto block bg-white shadow-md ${ready ? '' : 'hidden'}`}
        />
      </div>

      {fullscreen ? (
        <div className="pdf-viewer__fs-nav" role="group" aria-label="Navegación de páginas">
          <button
            type="button"
            className={navButton}
            onClick={() => goToPage(page - 1)}
            disabled={!ready || page <= 1}
          >
            ← Anterior
          </button>
          <p className="text-sm font-semibold text-[var(--ink)]" aria-live="polite">
            {page} / {numPages || '–'}
          </p>
          <button
            type="button"
            className={primaryNavButton}
            onClick={() => goToPage(page + 1)}
            disabled={!ready || page >= numPages}
          >
            Siguiente →
          </button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-[var(--stroke)] bg-white px-3 py-3 md:px-5">
          {navButtons}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[var(--ink-soft)]">
            <a
              href={active.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              onClick={() => trackEvent('pdf_original_opened', { promotionId, documentId: active.id })}
            >
              Abrir original
            </a>
            <a
              href={downloadUrl}
              download
              className="underline"
              onClick={() => trackEvent('pdf_download_clicked', { promotionId, documentId: active.id })}
            >
              Descargar
            </a>
            <button
              type="button"
              className="hidden underline md:inline"
              onClick={() => {
                enter();
                trackEvent('pdf_fullscreen_toggled', {
                  promotionId,
                  documentId: active.id,
                  fullscreen: true,
                });
              }}
            >
              Pantalla completa
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              enter();
              trackEvent('pdf_fullscreen_toggled', {
                promotionId,
                documentId: active.id,
                fullscreen: true,
              });
            }}
            className="w-full rounded-full bg-[var(--green-700)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--green-900)] md:hidden"
          >
            Ver en pantalla completa
          </button>
        </div>
      )}
    </section>
  );
}
