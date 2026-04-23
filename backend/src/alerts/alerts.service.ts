import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { estimatedPublicationVisibilityStart, withPromotionView } from '../common/promotion-view.util';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async upcoming() {
    const start = estimatedPublicationVisibilityStart();

    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
        estimatedPublicationDate: {
          gte: start,
        },
      },
      orderBy: [{ estimatedPublicationDate: 'asc' }, { createdAt: 'desc' }],
      take: 100,
    });

    return alerts.map(withPromotionView);
  }
}
