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

export function activeAlertWindowDates(now = new Date()) {
  const end = now;
  const start = new Date(now.getTime() - 67 * 24 * 60 * 60 * 1000);
  return { start, end };
}
