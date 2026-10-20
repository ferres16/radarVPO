import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3StorageService } from '../storage/s3-storage.service';
import { ListNewsDto } from './dto/list-news.dto';

type CacheEntry<T> = { value: T; expiresAt: number };

const NEWS_CACHE_TTL = Number(process.env.NEWS_CACHE_TTL_SECONDS ?? '60');
const COVER_SIGNED_TTL_SECONDS = Number(
  process.env.NEWS_COVER_SIGNED_URL_TTL_SECONDS ?? '3600',
);

type NewsCoverFields = {
  coverImageUrl?: string | null;
  coverImageAssetId?: string | null;
};

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3StorageService,
  ) {}

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

  private setCache<T>(key: string, value: T, ttl = NEWS_CACHE_TTL) {
    this.cache.set(key, { value, expiresAt: Date.now() + ttl * 1000 });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * El bucket S3 no es público: sustituye coverImageUrl por URL firmada legible.
   */
  private async withReadableCovers<T extends NewsCoverFields>(
    items: T[],
  ): Promise<Array<Omit<T, 'coverImageAssetId'>>> {
    return Promise.all(
      items.map(async (item) => {
        const { coverImageAssetId, ...rest } = item;
        if (!coverImageAssetId) {
          return rest;
        }
        try {
          const asset = await this.prisma.fileAsset.findUnique({
            where: { id: coverImageAssetId },
            select: { s3Key: true, status: true },
          });
          if (!asset || asset.status !== 'active') {
            return rest;
          }
          const url = await this.s3.getSignedReadUrl(
            asset.s3Key,
            COVER_SIGNED_TTL_SECONDS,
          );
          return { ...rest, coverImageUrl: url };
        } catch {
          return rest;
        }
      }),
    );
  }

  async list(query: ListNewsDto): Promise<unknown[]> {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = query.offset ?? 0;
    const cacheKey = `news:${query.q || ''}:${limit}:${offset}`;
    const cached = this.getFromCache<unknown[]>(cacheKey);
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
        coverImageUrl: true,
        coverImageAssetId: true,
        category: true,
        topic: true,
        relevance: true,
      },
    });

    const readable = await this.withReadableCovers(items);
    this.setCache(cacheKey, readable);
    return readable;
  }

  async byId(id: string): Promise<unknown> {
    const item = await this.prisma.newsItem.findUnique({
      where: { id },
      select: {
        id: true,
        slug: true,
        sourceName: true,
        sourceUrl: true,
        itemUrl: true,
        title: true,
        summary: true,
        body: true,
        practicalImpact: true,
        relevance: true,
        category: true,
        topic: true,
        municipality: true,
        publishedAt: true,
        createdAt: true,
        coverImageUrl: true,
        coverImageAssetId: true,
      },
    });
    if (!item) {
      throw new NotFoundException('News item not found');
    }
    const [readable] = await this.withReadableCovers([item]);
    return readable;
  }
}
