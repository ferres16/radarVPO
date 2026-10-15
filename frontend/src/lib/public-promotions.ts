import { canViewPromotionDocument } from '@/lib/promotion-access';
import { isAmendmentPublication } from '@/lib/promotion-content-filters';
import type { Promotion } from '@/types';

/** Promociones publicadas que se pueden mostrar en listados públicos. */
export function publicPublishedPromotions(
  promotions: readonly Promotion[],
  limit?: number,
): Promotion[] {
  const visible = promotions.filter(
    (item) =>
      item.status !== 'archived' &&
      canViewPromotionDocument(item) &&
      !isAmendmentPublication(item.title, item.publicDescription),
  );
  return typeof limit === 'number' ? visible.slice(0, limit) : visible;
}

export function uniqueMunicipalities(promotions: readonly Promotion[]): string[] {
  const values = new Set<string>();
  for (const item of promotions) {
    const name = item.municipality?.trim();
    if (name) values.add(name);
  }
  return [...values].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}
