/**
 * Última página vista de una guía PDF (no el máximo alcanzado).
 * Persistencia local por slug.
 */

const PREFIX = 'rv_guide_last_page:';

function keyFor(slug: string) {
  return `${PREFIX}${slug.trim()}`;
}

export function readGuideLastPage(slug: string): number | null {
  if (typeof window === 'undefined' || !slug.trim()) return null;
  try {
    const raw = window.localStorage.getItem(keyFor(slug));
    if (!raw) return null;
    const page = Number.parseInt(raw, 10);
    return Number.isFinite(page) && page >= 1 ? page : null;
  } catch {
    return null;
  }
}

export function writeGuideLastPage(slug: string, page: number): void {
  if (typeof window === 'undefined' || !slug.trim()) return;
  if (!Number.isFinite(page) || page < 1) return;
  try {
    window.localStorage.setItem(keyFor(slug), String(Math.floor(page)));
  } catch {
    // Quota / private mode: ignore.
  }
}

export function clampGuidePage(page: number, pageCount: number): number {
  if (!Number.isFinite(page) || pageCount < 1) return 1;
  return Math.min(pageCount, Math.max(1, Math.floor(page)));
}
