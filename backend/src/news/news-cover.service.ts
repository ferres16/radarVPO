import { Injectable, Logger } from '@nestjs/common';
import { AiProviderService } from '../ai/ai.provider.service';
import { FileStorageService } from '../storage/file-storage.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsCoverService {
  private readonly logger = new Logger(NewsCoverService.name);

  constructor(
    private readonly ai: AiProviderService,
    private readonly fileStorage: FileStorageService,
    private readonly prisma: PrismaService,
  ) {}

  /** Genera portada con IA, la sube a S3 y actualiza la noticia. No lanza si falla. */
  async attachGeneratedCover(newsId: string): Promise<boolean> {
    const news = await this.prisma.newsItem.findUnique({ where: { id: newsId } });
    if (!news) return false;
    if (news.coverImageUrl) return true;

    const generated = await this.ai.generateNewsCoverImage({
      title: news.title,
      summary: news.summary,
      category: news.category,
      municipality: news.municipality,
    });
    if (!generated) {
      this.logger.warn(`No cover generated for news ${newsId}`);
      return false;
    }

    try {
      const asset = await this.fileStorage.uploadBuffer({
        entityType: 'news',
        entityId: newsId,
        folder: `news/${newsId}/cover`,
        fileName: `cover-${newsId}.png`,
        contentType: generated.contentType,
        content: generated.buffer,
        isPublic: true,
      });

      await this.prisma.newsItem.update({
        where: { id: newsId },
        data: {
          coverImageUrl: asset.url,
          coverImageAssetId: asset.id,
        },
      });
      return true;
    } catch (error) {
      this.logger.warn(
        `Failed to store cover for news ${newsId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      return false;
    }
  }
}
