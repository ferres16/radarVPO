import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { activeAlertWindowDates, withPromotionView } from '../common/promotion-view.util';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async upcoming() {
    const { start, end } = activeAlertWindowDates();

    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
        alertDetectedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: [{ alertDetectedAt: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    return alerts.map(withPromotionView);
  }
}
