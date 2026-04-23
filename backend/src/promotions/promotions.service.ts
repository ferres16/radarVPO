import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PromotionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ListPromotionsDto } from './dto/list-promotions.dto';
import { withPromotionView } from '../common/promotion-view.util';

@Injectable()
export class PromotionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: ListPromotionsDto) {
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
      take: 10,
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return items.map(withPromotionView);
  }

  async getById(id: string) {
    const item = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
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
