import { canViewPromotionDocument } from '@/lib/promotion-access';
import { isAmendmentPublication } from '@/lib/promotion-content-filters';
import { canonicalizeMunicipality, municipalitiesMatch } from '@/lib/municipality';
import type { Promotion } from '@/types';

function publishedTime(promotion: Pick<Promotion, 'publishedAt' | 'createdAt'>): number {
  const raw = promotion.publishedAt || promotion.createdAt;
  if (!raw) return 0;
  const time = Date.parse(raw);
  return Number.isFinite(time) ? time : 0;
}

/** Promociones publicadas que se pueden mostrar en listados públicos. */
export function publicPublishedPromotions(
  promotions: readonly Promotion[],
  limit?: number,
): Promotion[] {
  const visible = promotions
    .filter(
      (item) =>
        item.status !== 'archived' &&
        canViewPromotionDocument(item) &&
        !isAmendmentPublication(item.title, item.publicDescription),
    )
    .sort((a, b) => publishedTime(b) - publishedTime(a));
  return typeof limit === 'number' ? visible.slice(0, limit) : visible;
}

export function uniqueMunicipalities(promotions: readonly Promotion[]): string[] {
  const values = new Set<string>();
  for (const item of promotions) {
    const name = canonicalizeMunicipality(item.municipality);
    if (name) values.add(name);
  }
  return [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

export function filterPromotionsByMunicipality(
  promotions: readonly Promotion[],
  municipality: string,
): Promotion[] {
  if (!municipality || municipality === 'all') return [...promotions];
  return promotions.filter((item) => municipalitiesMatch(item.municipality, municipality));
}

/** Misma localización que usa el SMS/email de PRO (municipio, provincia). */
export function promotionNotifyLocation(
  promotion: Pick<Promotion, 'municipality' | 'province'>,
): string {
  return [promotion.municipality, promotion.province].filter(Boolean).join(', ') || 'Cataluña';
}

export function promotionPlaceLabel(
  promotion: Pick<Promotion, 'municipality' | 'province'>,
): string {
  const municipality = canonicalizeMunicipality(promotion.municipality) || promotion.municipality?.trim() || '';
  const province = promotion.province?.trim() || '';
  if (municipality && province && municipality !== province) return `${municipality}, ${province}`;
  return municipality || province || 'Cataluña';
}
