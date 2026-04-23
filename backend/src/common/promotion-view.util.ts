import { PromotionStatus } from '@prisma/client';

type PromotionLike = {
  status: PromotionStatus;
  alertDetectedAt: Date;
};

export type PromotionViewType = 'alert' | 'published';

export function promotionViewType(status: PromotionStatus): PromotionViewType {
  return status === 'pending_review' ? 'alert' : 'published';
}

export function withPromotionView<T extends PromotionLike>(promotion: T) {
  return {
    ...promotion,
    type: promotionViewType(promotion.status),
    alertDate: promotion.alertDetectedAt,
  };
}

export function estimatedPublicationVisibilityStart(now = new Date()) {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}
