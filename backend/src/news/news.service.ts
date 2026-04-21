import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListNewsDto } from './dto/list-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListNewsDto) {
    return this.prisma.newsItem.findMany({
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
      take: 50,
    });
  }

  async byId(id: string) {
    const item = await this.prisma.newsItem.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('News item not found');
    }
    return item;
  }
}
