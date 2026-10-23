import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export const PRO_PACK_3M_RULE_KEY = 'pro_pack_3m_grants_guide';
export const PRO_PACK_3M_RULE_TYPE = 'pro_pack_3m_grants_guide';

export type ProPack3mConfig = {
  guideSlug: string;
  months: number;
  /** Precio del pack en céntimos (p. ej. 2997 = 29,97 €). */
  priceCents: number;
};

export type CommercePromoRuleDto = {
  id: string;
  key: string;
  name: string;
  ruleType: string;
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: string;
};

const DEFAULT_PACK_CONFIG: ProPack3mConfig = {
  guideSlug: 'vpo-inicial',
  months: 3,
  priceCents: 2997,
};

@Injectable()
export class PromoRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults(guideSlug = 'vpo-inicial'): Promise<void> {
    await this.prisma.commercePromoRule.upsert({
      where: { key: PRO_PACK_3M_RULE_KEY },
      create: {
        key: PRO_PACK_3M_RULE_KEY,
        name: 'Pack PRO 3 meses → guía inicial gratis',
        ruleType: PRO_PACK_3M_RULE_TYPE,
        enabled: true,
        config: {
          ...DEFAULT_PACK_CONFIG,
          guideSlug,
        },
      },
      update: {},
    });
  }

  async list(): Promise<CommercePromoRuleDto[]> {
    await this.ensureDefaults();
    const rows = await this.prisma.commercePromoRule.findMany({
      orderBy: { key: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async update(
    key: string,
    input: {
      name?: string;
      enabled?: boolean;
      config?: Record<string, unknown>;
    },
  ): Promise<CommercePromoRuleDto> {
    await this.ensureDefaults();
    const existing = await this.prisma.commercePromoRule.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(`Regla no encontrada: ${key}`);
    }
    const nextConfig = {
      ...((existing.config as Record<string, unknown>) || {}),
      ...(input.config || {}),
    };
    const updated = await this.prisma.commercePromoRule.update({
      where: { key },
      data: {
        name: input.name ?? existing.name,
        enabled:
          typeof input.enabled === 'boolean' ? input.enabled : existing.enabled,
        config: nextConfig as Prisma.InputJsonValue,
      },
    });
    return this.toDto(updated);
  }

  async getProPack3m(): Promise<
    (ProPack3mConfig & { enabled: boolean }) | null
  > {
    await this.ensureDefaults();
    const row = await this.prisma.commercePromoRule.findUnique({
      where: { key: PRO_PACK_3M_RULE_KEY },
    });
    if (!row) return null;
    const config = (row.config || {}) as Partial<ProPack3mConfig>;
    return {
      enabled: row.enabled,
      guideSlug:
        typeof config.guideSlug === 'string' && config.guideSlug.trim()
          ? config.guideSlug.trim()
          : DEFAULT_PACK_CONFIG.guideSlug,
      months:
        Number.isInteger(config.months) && (config.months as number) > 0
          ? (config.months as number)
          : DEFAULT_PACK_CONFIG.months,
      priceCents:
        Number.isInteger(config.priceCents) && (config.priceCents as number) > 0
          ? (config.priceCents as number)
          : DEFAULT_PACK_CONFIG.priceCents,
    };
  }

  private toDto(row: {
    id: string;
    key: string;
    name: string;
    ruleType: string;
    enabled: boolean;
    config: unknown;
    updatedAt: Date;
  }): CommercePromoRuleDto {
    return {
      id: row.id,
      key: row.key,
      name: row.name,
      ruleType: row.ruleType,
      enabled: row.enabled,
      config: (row.config as Record<string, unknown>) || {},
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
