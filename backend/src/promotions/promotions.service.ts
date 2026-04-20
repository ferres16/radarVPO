import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfOcrService } from '../jobs/pdf-ocr.service';
import { StructuredExtractionService } from '../jobs/structured-extraction.service';
import { ListPromotionsDto } from './dto/list-promotions.dto';

@Injectable()
export class PromotionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfOcrService: PdfOcrService,
    private readonly extractionService: StructuredExtractionService,
  ) {}

  async list(filters: ListPromotionsDto) {
    const publishedOnly = filters.publishedOnly === 'true';

    const where: Prisma.PromotionWhereInput = {
      municipality: filters.municipality
        ? { contains: filters.municipality, mode: 'insensitive' }
        : undefined,
      province: filters.province
        ? { contains: filters.province, mode: 'insensitive' }
        : undefined,
      promotionType: filters.promotionType,
      status: publishedOnly ? { in: ['open', 'closed'] } : filters.status,
      documents: publishedOnly ? { some: { fileType: 'pdf' } } : undefined,
    };

    return this.prisma.promotion.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 50,
    });
  }

  async getById(id: string) {
    const item = await this.prisma.promotion.findUnique({
      where: { id },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        aiAnalysis: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Promotion not found');
    }

    return item;
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
      include: { promotion: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reanalyzeTable(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        documents: true,
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    let refreshedDocs = 0;

    for (const document of promotion.documents) {
      if (!/pdf/i.test(document.fileType)) {
        continue;
      }

      const reparsed = await this.pdfOcrService.parseDocument(
        document.documentUrl,
        document.fileType,
        { preferTableOcr: true },
      );

      if (reparsed.text.length === 0) {
        continue;
      }

      if (reparsed.text !== (document.extractedText ?? '')) {
        await this.prisma.promotionDocument.update({
          where: { id: document.id },
          data: {
            extractedText: reparsed.text,
            processedAt: new Date(),
          },
        });
        document.extractedText = reparsed.text;
        refreshedDocs += 1;
      }
    }

    const sourceText = [
      promotion.rawText ?? '',
      ...promotion.documents
        .map((doc) => doc.extractedText ?? '')
        .filter((value) => value.trim().length > 0),
    ]
      .join('\n\n')
      .trim();

    const analysis = await this.extractionService.extractPromotionData(
      sourceText,
      promotion.sourceUrl,
    );

    await this.prisma.promotionAiAnalysis.create({
      data: {
        promotionId: promotion.id,
        model: `${analysis.provider}:${analysis.model}`,
        resultJson: analysis.result as Prisma.InputJsonValue,
        confidence: analysis.confidence,
      },
    });

    const extractedPromotion =
      (analysis.result.promotion as Record<string, unknown> | undefined) ?? {};
    const estimatedDate = extractedPromotion.estimated_publication_date;
    const isFutureLaunch =
      typeof extractedPromotion.future_launch === 'boolean'
        ? extractedPromotion.future_launch
        : false;

    const parsedDate =
      typeof estimatedDate === 'string' && !Number.isNaN(Date.parse(estimatedDate))
        ? new Date(estimatedDate)
        : null;

    await this.prisma.promotion.update({
      where: { id: promotion.id },
      data: {
        aiStatus: 'done',
        futureLaunch: isFutureLaunch,
        status: isFutureLaunch ? 'upcoming' : promotion.status,
        estimatedPublicationDate:
          isFutureLaunch && parsedDate
            ? parsedDate
            : promotion.estimatedPublicationDate,
      },
    });

    const units =
      (analysis.result.units as Record<string, unknown> | undefined) ?? {};
    const tableRows = Array.isArray(units.housing_table)
      ? units.housing_table.length
      : 0;

    return {
      ok: true,
      promotionId: promotion.id,
      refreshedDocs,
      housingTableRows: tableRows,
    };
  }
}
