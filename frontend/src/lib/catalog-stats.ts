import type { CatalogStats } from '@/types';

export type ProofItem = {
  value: string;
  label: string;
};

const SOCIAL_FLOORS = [200, 100, 50, 20] as const;

/** Umbral más alto que el recuento real alcanza. Por debajo de 20 no se muestra. */
export function floorSocialCount(count: number): string | null {
  if (!Number.isFinite(count) || count < 20) return null;
  const floor = SOCIAL_FLOORS.find((value) => count >= value);
  return floor ? `${floor}+` : null;
}

export function buildProofItems(
  stats: Partial<CatalogStats> | null,
  listed?: { published: number; municipalities: number },
): ProofItem[] {
  const published = stats?.publishedPromotions || listed?.published || 0;
  const municipalities = stats?.municipalities || listed?.municipalities || 0;
  const items: ProofItem[] = [];

  if (published > 0) {
    items.push({
      value: String(published),
      label: published === 1 ? 'promoción publicada' : 'promociones publicadas',
    });
  }
  if (municipalities > 0) {
    items.push({
      value: String(municipalities),
      label: municipalities === 1 ? 'municipio' : 'municipios',
    });
  }

  items.push({ value: '1000+', label: 'visitantes' });

  const pro = floorSocialCount(stats?.proSubscriptions ?? 0);
  if (pro) {
    items.push({ value: pro, label: 'suscripciones PRO' });
  }

  items.push({ value: '0 €', label: 'consultar el PDF oficial' });
  return items;
}
