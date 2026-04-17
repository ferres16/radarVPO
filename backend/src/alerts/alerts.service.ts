import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async upcoming() {
    return this.prisma.promotion.findMany({
      where: {
        status: 'upcoming',
      },
      orderBy: {
        estimatedPublicationDate: 'asc',
      },
      take: 50,
    });
  }
}
