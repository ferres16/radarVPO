import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { withPromotionView } from '../common/promotion-view.util';

const ALERTS_TAKE = Number(process.env.ALERTS_TAKE ?? '50');

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async upcoming(): Promise<unknown[]> {
    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
      },
      orderBy: [{ estimatedPublicationDate: 'asc' }, { alertDetectedAt: 'desc' }],
      take: ALERTS_TAKE,
      select: {
        id: true,
        title: true,
        municipality: true,
        province: true,
        promotionType: true,
        estimatedPublicationDate: true,
        alertDetectedAt: true,
        status: true,
      },
    });

    return alerts.map(withPromotionView);
  }
}
