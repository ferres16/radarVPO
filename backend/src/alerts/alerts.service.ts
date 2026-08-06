import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { withPromotionView } from '../common/promotion-view.util';
import {
  AMENDMENT_TITLE_CONTAINS,
  isAmendmentPublication,
} from '../common/promotion-content-filters';

const ALERTS_TAKE = Number(process.env.ALERTS_TAKE ?? '50');

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async upcoming(): Promise<unknown[]> {
    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
        AND: AMENDMENT_TITLE_CONTAINS.map((term) => ({
          NOT: { title: { contains: term, mode: 'insensitive' as const } },
        })),
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

    return alerts
      .filter((alert) => !isAmendmentPublication(alert.title))
      .map(withPromotionView);
  }
}
