import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListNewsDto } from './dto/list-news.dto';

type CacheEntry<T> = { value: T; expiresAt: number };

const NEWS_CACHE_TTL = Number(process.env.NEWS_CACHE_TTL_SECONDS ?? '60');

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  private cache = new Map<string, CacheEntry<any>>();

  private getFromCache<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  private setCache<T>(key: string, value: T, ttl = NEWS_CACHE_TTL) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }

  async list(query: ListNewsDto) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;
    const cacheKey = `news:${query.q || ''}:${limit}:${offset}`;
    const cached = this.getFromCache<any>(cacheKey);
    if (cached) return cached;

    const items = await this.prisma.newsItem.findMany({
      where: query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' } },
              { summary: { contains: query.q, mode: 'insensitive' } },
              { body: { contains: query.q, mode: 'insensitive' } },
              { practicalImpact: { contains: query.q, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { publishedAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        slug: true,
        sourceName: true,
        title: true,
        summary: true,
        publishedAt: true,
        createdAt: true,
      },
    });

    this.setCache(cacheKey, items);
    return items;
  }

  async byId(id: string) {
    const item = await this.prisma.newsItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('News item not found');
    }
    return item;
  }
}
