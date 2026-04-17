import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttachDocumentDto } from './dto/attach-document.dto';

@Injectable()
export class BackofficeService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [users, promotions, upcoming, news, jobsFailed] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.promotion.count(),
      this.prisma.promotion.count({ where: { status: 'upcoming' } }),
      this.prisma.newsItem.count(),
      this.prisma.jobRun.count({ where: { status: 'failed' } }),
    ]);

    return {
      users,
      promotions,
      upcoming,
      news,
      jobsFailed,
    };
  }

  async jobs() {
    return this.prisma.jobRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  async failures() {
    return this.prisma.deliveryFailure.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async attachPromotionDocument(promotionId: string, dto: AttachDocumentDto) {
    const created = await this.prisma.promotionDocument.create({
      data: {
        promotionId,
        documentUrl: dto.documentUrl,
        fileType: dto.fileType,
      },
    });

    await this.prisma.promotion.update({
      where: { id: promotionId },
      data: { aiStatus: 'pending' },
    });

    return created;
  }
}
