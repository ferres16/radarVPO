'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  slug: string;
  title: string;
  canAccess: boolean;
};

/**
 * Visor de guía PDF: carga el documento vía proxy del backend (inline).
 * Sin botón de descarga, sin enlace al original y con menú contextual bloqueado.
 */
export function GuidePdfViewer({ slug, title, canAccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);

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

        const pdf = await pdfjs.getDocument({ data }).promise;
        const host = containerRef.current;
        if (!host) return;
        host.innerHTML = '';
        setPageCount(pdf.numPages);

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.15 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'mb-4 w-full rounded-lg border border-[var(--stroke)] bg-white';
          canvas.setAttribute('aria-label', `${title} · página ${pageNum}`);
          canvas.draggable = false;
          const context = canvas.getContext('2d');
          if (!context) continue;
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          host.appendChild(canvas);
        }
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
    };
  }, [slug, title, canAccess]);

  if (!canAccess) {
    return (
      <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5">
        <p className="text-sm font-semibold text-[var(--ink)]">Consulta en pantalla</p>
        <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
          Compra o activa el acceso para ver esta guía aquí. No se puede descargar el PDF.
        </p>
      </div>
    );
  }

  return (
    <div
      className="space-y-3"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--green-700)]">
          Guía PDF · solo consulta (sin descarga)
        </p>
        {pageCount > 0 ? (
          <p className="text-xs text-[var(--ink-soft)]">
            {pageCount} {pageCount === 1 ? 'página' : 'páginas'}
          </p>
        ) : null}
      </div>
      {loading ? <p className="text-sm text-[var(--ink-soft)]">Cargando la guía…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div
        ref={containerRef}
        className="select-none"
        style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
      />
    </div>
  );
}
