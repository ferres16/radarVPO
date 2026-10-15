import type { PromotionDocument } from '@/types';

/**
 * Utilidades para el visor de documentos oficiales de una promoción.
 * Todo es puro (sin red) para poder probarlo.
 */

export type DocumentCategory = 'bases' | 'annex' | 'amendment' | 'list' | 'other';

const MAX_URL_LENGTH = 2048;

export function isSafePdfUrl(raw: string | null | undefined): boolean {
  if (!raw || raw.length > MAX_URL_LENGTH) return false;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;

  const host = url.hostname.toLowerCase();
  if (!host || host === 'localhost') return false;
  if (host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.localhost')) {
    return false;
  }
  // Direcciones IP literales (IPv4 / IPv6): no se permiten.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[')) {
    return false;
  }
  if (!host.includes('.')) return false;
  return true;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function fileNameFromDocument(document: Pick<PromotionDocument, 'originalName' | 'publicUrl'>) {
  const fromName = document.originalName?.trim();
  if (fromName) return safeDecode(fromName);
  try {
    const last = new URL(document.publicUrl).pathname.split('/').filter(Boolean).pop();
    return last ? safeDecode(last) : '';
  } catch {
    return '';
  }
}

export function isPdfDocument(
  document: Pick<PromotionDocument, 'fileType' | 'originalName' | 'publicUrl'>,
): boolean {
  if (document.fileType?.toLowerCase().includes('pdf')) return true;
  const name = fileNameFromDocument(document).toLowerCase();
  if (name.endsWith('.pdf')) return true;
  try {
    return new URL(document.publicUrl).pathname.toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}

export function classifyDocument(name: string): DocumentCategory {
  const value = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (/(esmena|correccio|correccion|rectific|modific|enmienda|errata)/.test(value)) {
    return 'amendment';
  }
  if (/(annex|anexo)/.test(value)) return 'annex';
  if (/(llistat|listado|resultat|resultado|sorteig|sorteo|admesos|admitidos)/.test(value)) {
    return 'list';
  }
  if (/(base|adjudicaci|convocatoria|anunci|anuncio)/.test(value)) return 'bases';
  return 'other';
}

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  bases: 'Bases',
  annex: 'Anexo',
  amendment: 'Modificación o corrección',
  list: 'Listado',
  other: 'Documento',
};

const CATEGORY_ORDER: Record<DocumentCategory, number> = {
  bases: 0,
  annex: 1,
  amendment: 2,
  list: 3,
  other: 4,
};

export type ViewableDocument = {
  id: string;
  category: DocumentCategory;
  /** Texto corto para el selector. */
  label: string;
  /** Nombre del archivo tal como lo publica la fuente. */
  fileName: string;
  /** Enlace directo al documento en su origen (se abre en otra pestaña). */
  originalUrl: string;
};

function cleanFileName(fileName: string) {
  return fileName.replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim();
}

export function getViewableDocuments(
  documents: PromotionDocument[] | null | undefined,
): ViewableDocument[] {
  const candidates = (documents ?? []).filter(
    (document) =>
      document.isPublic !== false &&
      isPdfDocument(document) &&
      isSafePdfUrl(document.publicUrl),
  );

  const mapped = candidates.map((document, index) => {
    const fileName = fileNameFromDocument(document);
    const title = document.title?.trim() || cleanFileName(fileName);
    const category = classifyDocument(`${document.title ?? ''} ${fileName}`);
    return {
      index,
      sortOrder: document.sortOrder ?? 0,
      value: {
        id: document.id,
        category,
        label: title || `${CATEGORY_LABEL[category]} ${index + 1}`,
        fileName,
        originalUrl: document.publicUrl,
      } satisfies ViewableDocument,
    };
  });

  mapped.sort(
    (a, b) =>
      CATEGORY_ORDER[a.value.category] - CATEGORY_ORDER[b.value.category] ||
      a.sortOrder - b.sortOrder ||
      a.index - b.index,
  );

  return mapped.map((entry) => entry.value);
}

export function categoryLabel(category: DocumentCategory): string {
  return CATEGORY_LABEL[category];
}

export function buildPdfProxyPath(
  promotionId: string,
  documentId: string,
  options: { download?: boolean } = {},
): string {
  const base = `/api/promotion-pdf/${encodeURIComponent(promotionId)}/${encodeURIComponent(documentId)}`;
  return options.download ? `${base}?download=1` : base;
}

export function clampZoom(value: number, min = 0.5, max = 3): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(max, Math.max(min, Math.round(value * 100) / 100));
}

export function clampPage(page: number, total: number): number {
  if (!Number.isFinite(page) || total < 1) return 1;
  return Math.min(total, Math.max(1, Math.floor(page)));
}

export function buildPdfFileName(fileName: string): string {
  const cleaned =
    fileName.replace(/[\\/:*?"<>|\r\n]+/g, ' ').replace(/\s+/g, ' ').trim() || 'documento';
  return /\.pdf$/i.test(cleaned) ? cleaned : `${cleaned}.pdf`;
}
