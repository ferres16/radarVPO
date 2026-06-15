import { Injectable } from '@nestjs/common';
import { ServiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  listPublicServices() {
    return this.prisma.service.findMany({
      where: { status: ServiceStatus.active },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        price: true,
        salePrice: true,
        currency: true,
        status: true,
        serviceType: true,
        stripePaymentLink: true,
      },
    });
  }
}
