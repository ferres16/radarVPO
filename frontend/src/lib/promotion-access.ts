import type { Promotion } from '@/types';

export function isAlertPromotion(promotion: Pick<Promotion, 'type' | 'status'>) {
  return promotion.type === 'alert' || promotion.status === 'pending_review';
}

/** Las promociones publicadas se consultan en el documento oficial (visor de PDF). */
export function canViewPromotionDocument(promotion: Pick<Promotion, 'type' | 'status'>) {
  return !isAlertPromotion(promotion);
}

/**
 * `pdfCount` solo viene en los listados; si no se conoce, se asume que puede haber PDF
 * y la página de detalle explica qué hacer cuando no lo hay.
 */
export function hasKnownPdf(promotion: Pick<Promotion, 'pdfCount'>) {
  return promotion.pdfCount === undefined || promotion.pdfCount > 0;
}
