import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PromotionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPromotionsDto } from './dto/list-promotions.dto';
import { withPromotionView } from '../common/promotion-view.util';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: ListPromotionsDto) {
    const limit = Math.min(filters.limit ?? 10, 50);
    const offset = filters.offset ?? 0;
    const publishedStatuses: PromotionStatus[] = [
      'published_unreviewed',
      'published_reviewed',
    ];
    const statusFilter = filters.status
      ? publishedStatuses.includes(filters.status as PromotionStatus)
        ? (filters.status as PromotionStatus)
        : null
      : { in: publishedStatuses };

    if (statusFilter === null) {
      return [];
    }

    const where: Prisma.PromotionWhereInput = {
      municipality: filters.municipality
        ? { contains: filters.municipality, mode: 'insensitive' }
        : undefined,
      province: filters.province
        ? { contains: filters.province, mode: 'insensitive' }
        : undefined,
      promotionType: filters.promotionType,
      status: statusFilter,
    };

    const items = await this.prisma.promotion.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        municipality: true,
        province: true,
        promotionType: true,
        status: true,
        publishedAt: true,
        estimatedPublicationDate: true,
        alertDetectedAt: true,
      },
    });

    return items.map(withPromotionView);
  }

  async getById(id: string) {
    const item = await this.prisma.promotion.findFirst({
      where: {
        id,
        status: { in: ['published_unreviewed', 'published_reviewed'] },
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
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            documentKind: true,
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

    return withPromotionView(item);
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

    await this.prisma.promotionFavorite.create({
      data: {
        userId,
        promotionId,
      },
    });

    return { favorite: true };
  }

  async listFavorites(userId: string) {
    return this.prisma.promotionFavorite.findMany({
      where: { userId },
      include: {
        promotion: {
          include: {
            documents: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
