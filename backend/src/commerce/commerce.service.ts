import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  COMMERCE_SETTINGS_KEY,
  DEFAULT_COMMERCE_SETTINGS,
  type CommerceSettings,
} from './commerce.types';

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

@Injectable()
export class CommerceService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<CommerceSettings> {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: COMMERCE_SETTINGS_KEY },
    });
    const raw = (row?.value ?? {}) as Record<string, unknown>;
    return {
      proEnabled: asBoolean(raw.proEnabled, DEFAULT_COMMERCE_SETTINGS.proEnabled),
      coursesEnabled: asBoolean(
        raw.coursesEnabled,
        DEFAULT_COMMERCE_SETTINGS.coursesEnabled,
      ),
      maintenanceMessage: asString(
        raw.maintenanceMessage,
        DEFAULT_COMMERCE_SETTINGS.maintenanceMessage,
      ),
      proPackGuideSlug: asString(
        raw.proPackGuideSlug,
        DEFAULT_COMMERCE_SETTINGS.proPackGuideSlug,
      ),
      allowPromotionCodes: asBoolean(
        raw.allowPromotionCodes,
        DEFAULT_COMMERCE_SETTINGS.allowPromotionCodes,
      ),
    };
  }

  async updateSettings(
    patch: Partial<CommerceSettings>,
  ): Promise<CommerceSettings> {
    const current = await this.getSettings();
    const next: CommerceSettings = {
      proEnabled:
        typeof patch.proEnabled === 'boolean' ? patch.proEnabled : current.proEnabled,
      coursesEnabled:
        typeof patch.coursesEnabled === 'boolean'
          ? patch.coursesEnabled
          : current.coursesEnabled,
      maintenanceMessage:
        typeof patch.maintenanceMessage === 'string'
          ? patch.maintenanceMessage.trim() || DEFAULT_COMMERCE_SETTINGS.maintenanceMessage
          : current.maintenanceMessage,
      proPackGuideSlug:
        typeof patch.proPackGuideSlug === 'string'
          ? patch.proPackGuideSlug.trim() || DEFAULT_COMMERCE_SETTINGS.proPackGuideSlug
          : current.proPackGuideSlug,
      allowPromotionCodes:
        typeof patch.allowPromotionCodes === 'boolean'
          ? patch.allowPromotionCodes
          : current.allowPromotionCodes,
    };

    await this.prisma.systemSetting.upsert({
      where: { key: COMMERCE_SETTINGS_KEY },
      create: {
        key: COMMERCE_SETTINGS_KEY,
        value: next as unknown as Prisma.InputJsonValue,
      },
      update: {
        value: next as unknown as Prisma.InputJsonValue,
      },
    });

    return next;
  }
}
