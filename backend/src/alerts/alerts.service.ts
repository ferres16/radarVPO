import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  estimatedPublicationVisibilityStart,
  withPromotionView,
} from '../common/promotion-view.util';

const ALERTS_CACHE_TTL = Number(process.env.ALERTS_CACHE_TTL_SECONDS ?? '30');
const ALERTS_TAKE = Number(process.env.ALERTS_TAKE ?? '50');

type CacheEntry<T> = { value: T; expiresAt: number };

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  private cache = new Map<string, CacheEntry<unknown>>();

  private getFromCache<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  private setCache<T>(key: string, value: T, ttl = ALERTS_CACHE_TTL) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }

  async upcoming(): Promise<unknown[]> {
    const start = estimatedPublicationVisibilityStart();
    const cacheKey = `alerts:${start.toISOString()}`;
    const cached = this.getFromCache<unknown[]>(cacheKey);
    if (cached) return cached;

    const alerts = await this.prisma.promotion.findMany({
      where: {
        status: 'pending_review',
        estimatedPublicationDate: {
          gte: start,
        },
      },
      orderBy: [{ estimatedPublicationDate: 'asc' }, { createdAt: 'desc' }],
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

    const result = alerts.map(withPromotionView);
    this.setCache(cacheKey, result);
    return result;
  }
}
