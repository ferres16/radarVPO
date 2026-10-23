export type PdfPageLink = {
  id: string;
  url?: string;
  pageNumber?: number;
  left: number;
  top: number;
  width: number;
  height: number;
};

type PdfLike = {
  getDestination?: (name: string) => Promise<unknown>;
  getPageIndex?: (ref: unknown) => Promise<number>;
};

type PdfPageLike = {
  getAnnotations: (opts?: { intent?: string }) => Promise<unknown[]>;
  getViewport: (opts: { scale: number }) => {
    convertToViewportPoint: (x: number, y: number) => number[];
  };
};

export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

async function destToPageNumber(pdf: PdfLike, dest: unknown): Promise<number | undefined> {
  let explicit = dest;
  if (typeof dest === 'string' && pdf.getDestination) {
    explicit = await pdf.getDestination(dest);
  }
  if (!Array.isArray(explicit) || !explicit[0] || !pdf.getPageIndex) return undefined;
  try {
    const index = await pdf.getPageIndex(explicit[0]);
    return Number.isInteger(index) ? index + 1 : undefined;
  } catch {
    return undefined;
  }
}

export async function collectPdfPageLinks(
  pdf: PdfLike,
  page: PdfPageLike,
  scale: number,
): Promise<PdfPageLink[]> {
  const annotations = await page.getAnnotations({ intent: 'display' });
  const viewport = page.getViewport({ scale });
  const links: PdfPageLink[] = [];

  for (const [index, raw] of annotations.entries()) {
    const annot = raw as {
      subtype?: string;
      rect?: number[];
      url?: string;
      unsafeUrl?: string;
      dest?: unknown;
    };
    if (annot.subtype !== 'Link' || !Array.isArray(annot.rect) || annot.rect.length < 4) continue;

    const [x1, y1] = viewport.convertToViewportPoint(annot.rect[0], annot.rect[1]);
    const [x2, y2] = viewport.convertToViewportPoint(annot.rect[2], annot.rect[3]);
    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);
    if (width < 2 || height < 2) continue;

    const rawUrl = annot.url || annot.unsafeUrl || '';
    const url = rawUrl && isSafeHttpUrl(rawUrl) ? rawUrl : undefined;
    const pageNumber = url ? undefined : await destToPageNumber(pdf, annot.dest);
    if (!url && !pageNumber) continue;

    links.push({
      id: `pdf-link-${index}`,
      url,
      pageNumber,
      left,
      top,
      width,
      height,
    });
  }

  return links;
}
