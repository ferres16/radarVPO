import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  COMMERCE_SETTINGS_KEY,
  DEFAULT_COMMERCE_SETTINGS,
  isSalesMode,
  type CommerceSettings,
  type SalesMode,
} from './commerce.types';

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function asOptionalCents(value: unknown, fallback: number | null): number | null {
  if (value === null) return null;
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const n = Number(value);
    if (Number.isInteger(n) && n >= 0) return n;
  }
  return fallback;
}

/**
 * Si falta salesMode en el JSON legacy:
 * - con algún interruptor de venta a true → live (compatibilidad con migración previa)
 * - si no → validation
 */
export function resolveSalesMode(
  raw: Record<string, unknown>,
  proEnabled: boolean,
  coursesEnabled: boolean,
): SalesMode {
  if (isSalesMode(raw.salesMode)) return raw.salesMode;
  if (proEnabled || coursesEnabled) return 'live';
  return DEFAULT_COMMERCE_SETTINGS.salesMode;
}

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<CommerceSettings> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: COMMERCE_SETTINGS_KEY },
    });
    const raw = (row?.value ?? {}) as Record<string, unknown>;
    const proEnabled = asBoolean(
      raw.proEnabled,
      DEFAULT_COMMERCE_SETTINGS.proEnabled,
    );
    const coursesEnabled = asBoolean(
      raw.coursesEnabled,
      DEFAULT_COMMERCE_SETTINGS.coursesEnabled,
    );
    return {
      salesMode: resolveSalesMode(raw, proEnabled, coursesEnabled),
      proEnabled,
      coursesEnabled,
      maintenanceMessage: asString(
        raw.maintenanceMessage,
        DEFAULT_COMMERCE_SETTINGS.maintenanceMessage,
      ),
      guideListPriceCents: asOptionalCents(
        raw.guideListPriceCents,
        DEFAULT_COMMERCE_SETTINGS.guideListPriceCents,
      ),
      proPackGuideSlug: asString(
        raw.proPackGuideSlug,
        DEFAULT_COMMERCE_SETTINGS.proPackGuideSlug,
      ),
      allowPromotionCodes: asBoolean(
        raw.allowPromotionCodes,
        DEFAULT_COMMERCE_SETTINGS.allowPromotionCodes,
      ),
      stripeAutomaticTax: asBoolean(
        raw.stripeAutomaticTax,
        DEFAULT_COMMERCE_SETTINGS.stripeAutomaticTax,
      ),
    };
  }

  async updateSettings(
    patch: Partial<CommerceSettings>,
  ): Promise<CommerceSettings> {
    const current = await this.getSettings();
    const next: CommerceSettings = {
      salesMode: isSalesMode(patch.salesMode)
        ? patch.salesMode
        : current.salesMode,
      proEnabled:
        typeof patch.proEnabled === 'boolean'
          ? patch.proEnabled
          : current.proEnabled,
      coursesEnabled:
        typeof patch.coursesEnabled === 'boolean'
          ? patch.coursesEnabled
          : current.coursesEnabled,
      maintenanceMessage:
        typeof patch.maintenanceMessage === 'string'
          ? patch.maintenanceMessage.trim() ||
            DEFAULT_COMMERCE_SETTINGS.maintenanceMessage
          : current.maintenanceMessage,
      guideListPriceCents:
        patch.guideListPriceCents === null
          ? null
          : typeof patch.guideListPriceCents === 'number' &&
              Number.isInteger(patch.guideListPriceCents) &&
              patch.guideListPriceCents >= 0
            ? patch.guideListPriceCents
            : current.guideListPriceCents,
      proPackGuideSlug:
        typeof patch.proPackGuideSlug === 'string'
          ? patch.proPackGuideSlug.trim() ||
            DEFAULT_COMMERCE_SETTINGS.proPackGuideSlug
          : current.proPackGuideSlug,
      allowPromotionCodes:
        typeof patch.allowPromotionCodes === 'boolean'
          ? patch.allowPromotionCodes
          : current.allowPromotionCodes,
      stripeAutomaticTax:
        typeof patch.stripeAutomaticTax === 'boolean'
          ? patch.stripeAutomaticTax
          : current.stripeAutomaticTax,
    };

    await this.prisma.systemSetting.upsert({
      where: { key: COMMERCE_SETTINGS_KEY },
      create: {
        key: COMMERCE_SETTINGS_KEY,
        value: next,
      },
      update: {
        value: next,
      },
    });

    return next;
  }
}
