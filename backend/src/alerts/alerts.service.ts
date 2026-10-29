import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { extractMunicipalityFromAlertTitle } from '../common/municipalities/catalunya-municipalities';
import { withPromotionView } from '../common/promotion-view.util';
import {
  AMENDMENT_TITLE_CONTAINS,
  isAlertCancellationNotice,
  isAmendmentPublication,
  isProperaAdjudicacioAlert,
  shortenAlertTitle,
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
      orderBy: [
        { estimatedPublicationDate: 'asc' },
        { alertDetectedAt: 'desc' },
      ],
      take: ALERTS_TAKE,
      select: {
        id: true,
        title: true,
        municipality: true,
        municipalityId: true,
        municipalityRaw: true,
        province: true,
        promotionType: true,
        estimatedPublicationDate: true,
        alertDetectedAt: true,
        status: true,
      },
    });

    const valid = alerts.filter(
      (alert) =>
        isProperaAdjudicacioAlert(alert.title) &&
        !isAmendmentPublication(alert.title) &&
        !isAlertCancellationNotice(alert.title),
    );
    const junkIds = alerts
      .filter((alert) => !valid.some((item) => item.id === alert.id))
      .map((alert) => alert.id);

    // Archive AVÍS / non-ALERTA rows that landed in pending_review (legacy scraper).
    if (junkIds.length > 0) {
      await this.prisma.promotion.updateMany({
        where: { id: { in: junkIds }, status: 'pending_review' },
        data: {
          status: 'archived',
          statusMessage:
            'Archivada automáticamente: solo cuentan como lanzamiento los títulos "ALERTA: Propera adjudicació…".',
        },
      });
    }

    const enriched = valid.map((alert) => {
      const inferred = extractMunicipalityFromAlertTitle(alert.title);
      const municipality =
        inferred.canonicalName ||
        alert.municipality ||
        null;
      const municipalityId = inferred.canonicalId || alert.municipalityId || null;

      // Autocorregir en caliente si el scrape dejó el municipio vacío o en MAYÚSCULAS.
      if (
        inferred.canonicalName &&
        (alert.municipality !== inferred.canonicalName ||
          alert.municipalityId !== municipalityId)
      ) {
        void this.prisma.promotion
          .update({
            where: { id: alert.id },
            data: {
              municipality: inferred.canonicalName,
              municipalityId: inferred.canonicalId,
              municipalityRaw: inferred.raw || alert.municipalityRaw,
              municipalityNeedsReview: inferred.needsReview,
            },
          })
          .catch(() => undefined);
      }

      return withPromotionView({
        ...alert,
        title: shortenAlertTitle(alert.title),
        municipality,
        municipalityId,
      });
    });

    return enriched;
  }
}
