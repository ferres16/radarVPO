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
      .map((alert) =>
        withPromotionView({
          ...alert,
          title: shortenStoredAlertTitle(alert.title),
        }),
      );
  }
}

function shortenStoredAlertTitle(title: string): string {
  return title
    .replace(
      /\s*En el termini de\s+\d+\s*dies\s+es\s+publicar[àa]\s+l['’]anunci\s+amb\s+els\s+detalls\s+i\s+on\s+es\s+recollir[àa]\s+el\s+procediment\s+d['’]adjudicaci[oó]\.?/gi,
      '',
    )
    .replace(
      /\s*En el plazo de\s+\d+\s*d[ií]as\s+se\s+publicar[áa]\s+el\s+anuncio\s+con\s+los\s+detalles\s+y\s+donde\s+se\s+recoger[áa]\s+el\s+procedimiento\s+de\s+adjudicaci[oó]n\.?/gi,
      '',
    )
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*$/, '.')
    .trim();
}
