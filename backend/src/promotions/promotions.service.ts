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
import {
  canUseRegisteredBenefits,
  resolveAccessTier,
  VISITOR_PROMOTION_DETAIL_LIMIT,
  VISITOR_PROMOTION_LIST_LIMIT,
  type AccessTier,
} from '../common/access-tier';
import { MetricsService } from '../metrics/metrics.service';
import { FileStorageService } from '../storage/file-storage.service';
import { isValidShortCode } from '../notifications/short-link';

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

  async resolveViewerTier(userId?: string | null): Promise<AccessTier> {
    if (!userId) return 'visitor';
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerifiedAt: true,
        plan: true,
        subscriptions: {
          where: {
            planKey: 'pro',
            status: {
              in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
            },
          },
          select: { id: true },
          take: 1,
        },
      },
    });
    return resolveAccessTier({
      emailVerifiedAt: user?.emailVerifiedAt,
      plan: user?.plan,
      hasActiveProSubscription: (user?.subscriptions.length ?? 0) > 0,
    });
  }

  /** Ids de las N promociones publicadas más recientes (detalle abierto a visitantes). */
  async getLatestPublishedIds(
    limit = VISITOR_PROMOTION_DETAIL_LIMIT,
  ): Promise<string[]> {
    const rows = await this.prisma.promotion.findMany({
      where: {
        status: { in: PUBLIC_PROMOTION_STATUSES },
        AND: [
          { NOT: { title: { contains: 'alerta', mode: 'insensitive' } } },
          ...AMENDMENT_TITLE_CONTAINS.map((term) => ({
            NOT: { title: { contains: term, mode: 'insensitive' as const } },
          })),
        ],
      },
      orderBy: [
        { publishedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: Math.max(limit * 4, 20),
      select: {
        id: true,
        title: true,
        publicDescription: true,
      },
    });

    return rows
      .filter(
        (item) => !isAmendmentPublication(item.title, item.publicDescription),
      )
      .slice(0, limit)
      .map((item) => item.id);
  }

  async list(filters: ListPromotionsDto, userId?: string | null) {
    const tier = await this.resolveViewerTier(userId);
    const requested = Math.min(filters.limit ?? 10, 100);
    const limit = canUseRegisteredBenefits(tier)
      ? requested
      : Math.min(requested, VISITOR_PROMOTION_LIST_LIMIT);
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
      orderBy: [
        { publishedAt: { sort: 'desc', nulls: 'last' } },
        { createdAt: 'desc' },
      ],
      take: Math.min(limit * 3, 200),
      skip: offset,
      select: {
        id: true,
        title: true,
        municipality: true,
        municipalityRaw: true,
        municipalityId: true,
        municipalityNeedsReview: true,
        province: true,
        promotionType: true,
        status: true,
        promoter: true,
        publicDescription: true,
        totalHomes: true,
        publishedAt: true,
        createdAt: true,
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

    const registered = canUseRegisteredBenefits(tier);
    const unlockedIds = registered
      ? null
      : new Set(
          await this.getLatestPublishedIds(VISITOR_PROMOTION_DETAIL_LIMIT),
        );

    return items
      .filter(
        (item) => !isAmendmentPublication(item.title, item.publicDescription),
      )
      .slice(0, limit)
      .map(({ _count, ...item }) =>
        withPromotionView({
          ...item,
          pdfCount: _count.documents,
          detailLocked: unlockedIds ? !unlockedIds.has(item.id) : false,
        }),
      );
  }

  /** Enlace corto de SMS (/p/<código>) → id de la promoción visible. */
  async resolveShortCode(code: string): Promise<{ id: string }> {
    const normalized = code.trim().toLowerCase();
    if (!isValidShortCode(normalized)) {
      throw new NotFoundException('Enlace no válido');
    }
    const matches = await this.prisma.promotion.findMany({
      where: {
        id: { endsWith: normalized },
        status: {
          in: ['pending_review', 'published_unreviewed', 'published_reviewed'],
        },
      },
      select: { id: true },
      take: 2,
    });
    if (matches.length !== 1) {
      throw new NotFoundException('Enlace no encontrado');
    }
    return { id: matches[0].id };
  }

  async getById(id: string, userId?: string | null) {
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
        municipalityRaw: true,
        municipalityId: true,
        municipalityNeedsReview: true,
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

    const tier = await this.resolveViewerTier(userId);
    const isPublished = PUBLIC_PROMOTION_STATUSES.includes(item.status);
    let detailLocked = false;
    if (!canUseRegisteredBenefits(tier) && isPublished) {
      const unlockedIds = await this.getLatestPublishedIds(
        VISITOR_PROMOTION_DETAIL_LIMIT,
      );
      detailLocked = !unlockedIds.includes(item.id);
    }

    if (detailLocked) {
      const teaser = {
        ...item,
        documents: [],
        units: [],
        generalInfo: null,
        importantDates: null,
        requirements: null,
        economicInfo: null,
        feesAndReservations: null,
        contactInfo: null,
        availableUnitsText: null,
        detailLocked: true as const,
        lockReason: 'register_verify' as const,
        accessTier: tier,
      };
      return withPromotionView(teaser);
    }

    return withPromotionView({
      ...(await this.withSignedPromotionDocuments(item)),
      detailLocked: false as const,
      lockReason: null,
      accessTier: tier,
    });
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

    await this.assertEmailVerified(userId);
    await this.assertCanSaveAnotherFavorite(userId);

    await this.prisma.promotionFavorite.create({
      data: {
        userId,
        promotionId,
      },
    });

    return { favorite: true };
  }

  private async assertEmailVerified(userId: string) {
    const tier = await this.resolveViewerTier(userId);
    if (!canUseRegisteredBenefits(tier)) {
      throw new ForbiddenException(
        'Verifica tu email para guardar promociones y usar las ventajas de la cuenta.',
      );
    }
  }

  /** Las cuentas gratuitas verificadas pueden guardar hasta FREE_SAVED_PROMOTIONS_LIMIT promociones. */
  private async assertCanSaveAnotherFavorite(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        emailVerifiedAt: true,
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
    const isPro =
      Boolean(user?.emailVerifiedAt) &&
      (user?.plan === 'pro' || (user?.subscriptions.length ?? 0) > 0);
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
