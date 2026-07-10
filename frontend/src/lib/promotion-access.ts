import type { Promotion } from '@/types';

export function isAlertPromotion(promotion: Pick<Promotion, 'type' | 'status'>) {
  return promotion.type === 'alert' || promotion.status === 'pending_review';
}

export function hasPublicFicha(promotion: Pick<Promotion, 'type' | 'status'>) {
  return !isAlertPromotion(promotion);
}
