import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromotionStatus, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPromotionsDto } from './dto/list-promotions.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { normalizeChecklist } from './favorite-checklist';
import { withPromotionView } from '../common/promotion-view.util';
import {
  AMENDMENT_TITLE_CONTAINS,
  isAmendmentPublication,
} from '../common/promotion-content-filters';
import { MetricsService } from '../metrics/metrics.service';
import { FileStorageService } from '../storage/file-storage.service';

export const FREE_SAVED_PROMOTIONS_LIMIT = 3;

const PUBLIC_PROMOTION_STATUSES: PromotionStatus[] = [
  'published_unreviewed',
  'published_reviewed',
];

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly metrics: MetricsService,
  ) {}

  async list(filters: ListPromotionsDto) {
    const limit = Math.min(filters.limit ?? 10, 100);
    const offset = filters.offset ?? 0;
    const statusFilter = filters.status
      ? PUBLIC_PROMOTION_STATUSES.includes(filters.status)
        ? (filters.status as PromotionStatus)
        : null
      : { in: PUBLIC_PROMOTION_STATUSES };

    if (statusFilter === null) {
      return [];
    }

    const search = filters.q?.trim();
    const where: Prisma.PromotionWhereInput = {
      municipality: filters.municipality
        ? { contains: filters.municipality, mode: 'insensitive' }
        : undefined,
      province: filters.province
        ? { contains: filters.province, mode: 'insensitive' }
        : undefined,
      promotionType: filters.promotionType,
      status: statusFilter,
      AND: [
        { NOT: { title: { contains: 'alerta', mode: 'insensitive' } } },
        ...AMENDMENT_TITLE_CONTAINS.map((term) => ({
          NOT: { title: { contains: term, mode: 'insensitive' as const } },
        })),
      ],
      OR: search
        ? [
            { title: { contains: search, mode: 'insensitive' } },
            { municipality: { contains: search, mode: 'insensitive' } },
            { province: { contains: search, mode: 'insensitive' } },
            { promoter: { contains: search, mode: 'insensitive' } },
            { publicDescription: { contains: search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const items = await this.prisma.promotion.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit * 3, 200),
      skip: offset,
      select: {
        id: true,
        title: true,
        municipality: true,
        province: true,
        promotionType: true,
        status: true,
        promoter: true,
        publicDescription: true,
        totalHomes: true,
        publishedAt: true,
        deadlineDate: true,
        estimatedPublicationDate: true,
        alertDetectedAt: true,
        sourceUrl: true,
        _count: {
          select: {
            documents: {
              where: {
                isPublic: true,
                fileType: { contains: 'pdf', mode: 'insensitive' },
              },
            },
          },
        },
      },
    });

    return items
      .filter(
        (item) => !isAmendmentPublication(item.title, item.publicDescription),
      )
      .slice(0, limit)
      .map(({ _count, ...item }) =>
        withPromotionView({ ...item, pdfCount: _count.documents }),
      );
  }

  async getById(id: string) {
    const item = await this.prisma.promotion.findFirst({
      where: {
        id,
        status: {
          in: ['pending_review', 'published_unreviewed', 'published_reviewed'],
        },
      },
      select: {
        id: true,
        title: true,
        location: true,
        municipality: true,
        province: true,
        autonomousCommunity: true,
        promotionType: true,
        targetScope: true,
        tenureType: true,
        status: true,
        publishedAt: true,
        deadlineDate: true,
        estimatedPublicationDate: true,
        sourceUrl: true,
        alertDetectedAt: true,
        statusMessage: true,
        promoter: true,
        totalHomes: true,
        generalInfo: true,
        importantDates: true,
        requirements: true,
        economicInfo: true,
        feesAndReservations: true,
        contactInfo: true,
        publicDescription: true,
        availableUnitsText: true,
        isProOnly: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          where: { isPublic: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          select: {
            id: true,
            fileAssetId: true,
            documentKind: true,
            title: true,
            description: true,
            altText: true,
            sortOrder: true,
            isFeatured: true,
            isPublic: true,
            section: true,
            fileType: true,
            originalName: true,
            publicUrl: true,
            createdAt: true,
          },
        },
        units: {
          orderBy: { rowOrder: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Promotion not found');
    }

    if (isAmendmentPublication(item.title, item.publicDescription)) {
      throw new NotFoundException('Promotion not found');
    }

    return withPromotionView(await this.withSignedPromotionDocuments(item));
  }

  async toggleFavorite(userId: string, promotionId: string) {
    const existing = await this.prisma.promotionFavorite.findUnique({
      where: {
        userId_promotionId: {
          userId,
          promotionId,
        },
      },
    });

    if (existing) {
      await this.prisma.promotionFavorite.delete({
        where: { id: existing.id },
      });
      return { favorite: false };
    }

    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      select: { id: true },
    });
    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    await this.assertCanSaveAnotherFavorite(userId);

    await this.prisma.promotionFavorite.create({
      data: {
        userId,
        promotionId,
      },
    });

    return { favorite: true };
  }

  /** Las cuentas gratuitas pueden guardar hasta FREE_SAVED_PROMOTIONS_LIMIT promociones. */
  private async assertCanSaveAnotherFavorite(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        subscriptions: {
          where: {
            planKey: 'pro',
            status: { in: ['active', 'trialing'] },
          },
          select: { id: true },
          take: 1,
        },
      },
    });
    const isPro = user?.plan === 'pro' || (user?.subscriptions.length ?? 0) > 0;
    if (isPro) return;

    const saved = await this.prisma.promotionFavorite.count({
      where: { userId },
    });
    if (saved >= FREE_SAVED_PROMOTIONS_LIMIT) {
      throw new ForbiddenException(
        `Con la cuenta gratuita puedes guardar hasta ${FREE_SAVED_PROMOTIONS_LIMIT} promociones. Quita alguna o pasa a Radar VPO PRO para guardar sin límite.`,
      );
    }
  }

  async updateFavorite(
    userId: string,
    promotionId: string,
    dto: UpdateFavoriteDto,
  ) {
    const existing = await this.prisma.promotionFavorite.findUnique({
      where: { userId_promotionId: { userId, promotionId } },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException('Guarda la promoción antes de editarla');
    }

    return this.prisma.promotionFavorite.update({
      where: { id: existing.id },
      data: {
        ...(dto.stage ? { stage: dto.stage } : {}),
        ...(dto.notes !== undefined ? { notes: dto.notes.trim() || null } : {}),
        ...(dto.checklistDone
          ? { checklistDone: normalizeChecklist(dto.checklistDone) }
          : {}),
      },
      select: {
        id: true,
        stage: true,
        notes: true,
        checklistDone: true,
        updatedAt: true,
      },
    });
  }

  async listFavorites(userId: string) {
    return this.prisma.promotionFavorite.findMany({
      where: { userId },
      include: {
        promotion: {
          include: {
            documents: {
              where: { isPublic: true },
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async withSignedPromotionDocuments<
    T extends {
      documents: Array<{ fileAssetId: string | null; publicUrl: string }>;
    },
  >(promotion: T): Promise<T> {
    const documents = await Promise.all(
      promotion.documents.map(async (document) => {
        if (!document.fileAssetId) {
          return document;
        }

        try {
          const access = await this.fileStorage.getAccessibleUrl(
            document.fileAssetId,
            true,
            { preferSigned: true },
          );
          return { ...document, publicUrl: access.url || document.publicUrl };
        } catch {
          return document;
        }
      }),
    );

    return { ...promotion, documents };
  }

  async publicStats() {
    const publishedWhere: Prisma.PromotionWhereInput = {
      status: { in: PUBLIC_PROMOTION_STATUSES },
      AND: [
        { NOT: { title: { contains: 'alerta', mode: 'insensitive' } } },
        ...AMENDMENT_TITLE_CONTAINS.map((term) => ({
          NOT: { title: { contains: term, mode: 'insensitive' as const } },
        })),
      ],
    };

    const [
      publishedPromotions,
      groupedMunicipalities,
      accounts,
      proSubscriptions,
      visitors,
    ] = await Promise.all([
      this.prisma.promotion.count({ where: publishedWhere }),
      this.prisma.promotion.groupBy({
        by: ['municipality'],
        where: { ...publishedWhere, municipality: { not: null } },
      }),
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          OR: [
            { plan: 'pro' },
            {
              subscriptions: {
                some: {
                  planKey: 'pro',
                  status: {
                    in: [
                      SubscriptionStatus.active,
                      SubscriptionStatus.trialing,
                    ],
                  },
                },
              },
            },
          ],
        },
      }),
      this.metrics.getVisitorCount(),
    ]);

    return {
      publishedPromotions,
      municipalities: groupedMunicipalities.filter((row) =>
        row.municipality?.trim(),
      ).length,
      accounts,
      proSubscriptions,
      visitors,
    };
  }
}
