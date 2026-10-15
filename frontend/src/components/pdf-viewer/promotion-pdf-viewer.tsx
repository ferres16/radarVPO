'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist';
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

const iconButton =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-[var(--stroke)] bg-white px-3 text-sm font-semibold text-[var(--ink)] outline-none transition hover:bg-[var(--bg-eco)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)] disabled:cursor-not-allowed disabled:opacity-40';
const linkButton =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] outline-none transition hover:bg-[var(--bg-eco)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]';

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

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  const active = documents.find((item) => item.id === activeId) ?? documents[0];
  const proxyUrl = active ? buildPdfProxyPath(promotionId, active.id) : '';
  const downloadUrl = active ? buildPdfProxyPath(promotionId, active.id, { download: true }) : '';

  // Ancho disponible (el visor se ajusta al ancho y el zoom parte de ahí).
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
  }, []);

  // Carga del documento activo.
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    setStatus('loading');
    setProgress(null);
    setNumPages(0);
    setPage(1);
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
          void pdf.destroy();
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

  // Pintado de la página actual.
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

  return (
    <section
      aria-label="Documento oficial de la promoción"
      className="premium-card overflow-hidden p-0"
    >
      {documents.length > 1 ? (
        <div className="border-b border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-3 md:px-5">
          <label htmlFor="pdf-document-select" className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
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
        <div className="border-b border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-3 md:px-5">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
            {categoryLabel(active.category)}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-[var(--ink)]">{active.label}</p>
        </div>
      )}

      <div
        className="flex flex-wrap items-center gap-2 border-b border-[var(--stroke)] bg-white px-3 py-2.5 md:px-5"
        role="toolbar"
        aria-label="Controles del visor"
      >
        <button
          type="button"
          className={iconButton}
          onClick={() => goToPage(page - 1)}
          disabled={status !== 'ready' || page <= 1}
          aria-label="Página anterior"
        >
          ‹
        </button>
        <label className="flex items-center gap-1.5 text-sm text-[var(--ink-soft)]">
          <span className="sr-only">Número de página</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={Math.max(numPages, 1)}
            value={page}
            disabled={status !== 'ready'}
            onChange={(event) => goToPage(Number(event.target.value))}
            className="h-11 w-16 rounded-xl border border-[var(--stroke)] bg-white px-2 text-center text-sm font-semibold text-[var(--ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] disabled:opacity-40"
          />
          <span aria-live="polite">/ {numPages || '–'}</span>
        </label>
        <button
          type="button"
          className={iconButton}
          onClick={() => goToPage(page + 1)}
          disabled={status !== 'ready' || page >= numPages}
          aria-label="Página siguiente"
        >
          ›
        </button>

        <span className="mx-1 hidden h-6 w-px bg-[var(--stroke)] sm:block" aria-hidden="true" />

        <button
          type="button"
          className={iconButton}
          onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
          disabled={status !== 'ready' || zoom <= 0.5}
          aria-label="Alejar"
        >
          −
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => setZoom(1)}
          disabled={status !== 'ready'}
          aria-label="Ajustar al ancho"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
          disabled={status !== 'ready' || zoom >= 3}
          aria-label="Acercar"
        >
          +
        </button>

        <div className="ml-auto flex flex-wrap gap-2">
          <a
            href={active.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={linkButton}
            onClick={() => trackEvent('pdf_original_opened', { promotionId, documentId: active.id })}
          >
            Abrir original
          </a>
          <a
            href={downloadUrl}
            download
            className={linkButton}
            onClick={() => trackEvent('pdf_download_clicked', { promotionId, documentId: active.id })}
          >
            Descargar
          </a>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative min-h-[60vh] overflow-auto bg-[#eef1f4] p-0 md:p-3"
        style={{ maxHeight: '80vh' }}
        tabIndex={0}
        onKeyDown={(event) => {
          if (status !== 'ready') return;
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
              El origen no responde o no permite incrustarlo. Puedes abrirlo directamente en su web
              oficial o volver a intentarlo.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <a href={active.originalUrl} target="_blank" rel="noopener noreferrer" className={linkButton}>
                Abrir el original
              </a>
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className={linkButton}>
                Ver fuente oficial
              </a>
              <button type="button" className={linkButton} onClick={() => setReloadKey((value) => value + 1)}>
                Reintentar
              </button>
            </div>
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          aria-label={`Página ${page} de ${numPages || '…'} de ${active.label}`}
          className={`mx-auto block bg-white shadow-md ${status === 'ready' ? '' : 'hidden'}`}
        />
      </div>
    </section>
  );
}
