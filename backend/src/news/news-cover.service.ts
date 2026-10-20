import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai/ai.provider.service';
import { FileStorageService } from '../storage/file-storage.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewsService } from './news.service';

/** Fotos editoriales de Unsplash (vivienda / ciudad) como respaldo si falla la IA. */
const FALLBACK_COVERS: Record<string, string[]> = {
  vpo: [
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  alquiler: [
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  ayudas: [
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  normativa: [
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
  general: [
    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=800&q=80',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&h=800&q=80',
  ],
};

@Injectable()
export class NewsCoverService {
  private readonly logger = new Logger(NewsCoverService.name);

  constructor(
    private readonly ai: AiProviderService,
    private readonly fileStorage: FileStorageService,
    private readonly prisma: PrismaService,
    private readonly newsService: NewsService,
  ) {}

  /** Genera portada con IA (o fallback), la sube a S3 y actualiza la noticia. */
  async attachGeneratedCover(newsId: string): Promise<boolean> {
    const news = await this.prisma.newsItem.findUnique({ where: { id: newsId } });
    if (!news) return false;
    if (news.coverImageUrl) return true;

    let buffer: Buffer | null = null;
    let contentType = 'image/png';
    let source = 'openai';

    const generated = await this.ai.generateNewsCoverImage({
      title: news.title,
      summary: news.summary,
      category: news.category,
      municipality: news.municipality,
    });

    if (generated) {
      buffer = generated.buffer;
      contentType = generated.contentType;
    } else {
      const fallback = await this.downloadFallbackCover(
        news.category,
        news.id,
      );
      if (!fallback) {
        this.logger.warn(`No cover available for news ${newsId}`);
        return false;
      }
      buffer = fallback.buffer;
      contentType = fallback.contentType;
      source = 'fallback';
    }

    try {
      const ext = contentType.includes('jpeg') || contentType.includes('jpg')
        ? 'jpg'
        : 'png';
      const asset = await this.fileStorage.uploadBuffer({
        entityType: 'news',
        entityId: newsId,
        folder: `news/${newsId}/cover`,
        fileName: `cover-${newsId}.${ext}`,
        contentType,
        content: buffer,
        isPublic: true,
      });

      if (!asset.url) {
        this.logger.warn(
          `Cover uploaded for ${newsId} but public URL is empty (check AWS_S3_PUBLIC_BASE_URL)`,
        );
      }

      await this.prisma.newsItem.update({
        where: { id: newsId },
        data: {
          coverImageUrl: asset.url,
          coverImageAssetId: asset.id,
        },
      });
      this.newsService.clearCache();
      this.logger.log(`Cover attached for news ${newsId} via ${source}`);
      return Boolean(asset.url);
    } catch (error) {
      this.logger.warn(
        `Failed to store cover for news ${newsId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }

  /** Rellena portadas faltantes en noticias recientes. */
  async backfillMissingCovers(limit = 20): Promise<{
    scanned: number;
    attached: number;
    failed: number;
  }> {
    const items = await this.prisma.newsItem.findMany({
      where: { OR: [{ coverImageUrl: null }, { coverImageUrl: '' }] },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
      select: { id: true },
    });

    let attached = 0;
    let failed = 0;
    for (const item of items) {
      const ok = await this.attachGeneratedCover(item.id);
      if (ok) attached += 1;
      else failed += 1;
    }
    return { scanned: items.length, attached, failed };
  }

  private async downloadFallbackCover(
    category: string | null | undefined,
    seed: string,
  ): Promise<{ buffer: Buffer; contentType: string } | null> {
    const key = (category || 'general').toLowerCase();
    const pool = FALLBACK_COVERS[key] || FALLBACK_COVERS.general;
    const index =
      Math.abs(
        [...seed].reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
      ) % pool.length;
    const url = pool[index];

    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'RadarVPO/1.0' },
      });
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      const contentType =
        response.headers.get('content-type') || 'image/jpeg';
      return { buffer: Buffer.from(arrayBuffer), contentType };
    } catch (error) {
      this.logger.warn(
        `Fallback cover download failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
