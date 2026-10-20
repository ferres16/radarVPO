import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const VISITORS_KEY = 'metrics.unique_visitors';

type VisitorsValue = { count: number; updatedAt?: string };

@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) {}

  async getVisitorCount(): Promise<number> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: VISITORS_KEY },
    });
    const value = row?.value as VisitorsValue | null;
    const count = Number(value?.count);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  }

  /**
   * Incrementa visitantes únicos aproximados (1 por visitante/día vía cookie del cliente).
   * El front solo llama una vez al día por navegador.
   */
  async recordUniqueVisit(): Promise<{ count: number }> {
    const existing = await this.prisma.systemSetting.findUnique({
      where: { key: VISITORS_KEY },
    });
    const current = Number((existing?.value as VisitorsValue | null)?.count) || 0;
    const next = current + 1;
    const payload: VisitorsValue = {
      count: next,
      updatedAt: new Date().toISOString(),
    };

    await this.prisma.systemSetting.upsert({
      where: { key: VISITORS_KEY },
      create: {
        key: VISITORS_KEY,
        value: payload as unknown as Prisma.InputJsonValue,
      },
      update: {
        value: payload as unknown as Prisma.InputJsonValue,
      },
    });

    return { count: next };
  }
}
