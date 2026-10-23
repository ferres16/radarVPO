import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  MESSAGE_TEMPLATE_SEED_REVISION,
  MESSAGE_TEMPLATE_SEEDS,
} from './message-templates.defaults';
import { renderTemplate } from '../notifications/message-vars';

export type MessageTemplateDto = {
  id: string;
  key: string;
  label: string;
  description: string | null;
  channel: string;
  emailSubject: string | null;
  emailBody: string | null;
  smsBody: string | null;
  active: boolean;
  isCustomized: boolean;
  seedRevision: number;
  updatedAt: string;
};

export type UpdateMessageTemplateInput = {
  label?: string;
  description?: string | null;
  channel?: string;
  emailSubject?: string | null;
  emailBody?: string | null;
  smsBody?: string | null;
  active?: boolean;
};

@Injectable()
export class MessageTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults(): Promise<void> {
    for (const seed of MESSAGE_TEMPLATE_SEEDS) {
      const existing = await this.prisma.messageTemplate.findUnique({
        where: { key: seed.key },
      });
      if (!existing) {
        await this.prisma.messageTemplate.create({
          data: {
            key: seed.key,
            label: seed.label,
            description: seed.description,
            channel: seed.channel,
            emailSubject: seed.emailSubject,
            emailBody: seed.emailBody,
            smsBody: seed.smsBody,
            active: seed.active !== false,
            isCustomized: false,
            seedRevision: MESSAGE_TEMPLATE_SEED_REVISION,
          },
        });
        continue;
      }

      if (
        !existing.isCustomized &&
        existing.seedRevision < MESSAGE_TEMPLATE_SEED_REVISION
      ) {
        await this.prisma.messageTemplate.update({
          where: { key: seed.key },
          data: {
            label: seed.label,
            description: seed.description,
            channel: seed.channel,
            emailSubject: seed.emailSubject,
            emailBody: seed.emailBody,
            smsBody: seed.smsBody,
            active: seed.active !== false,
            seedRevision: MESSAGE_TEMPLATE_SEED_REVISION,
          },
        });
      }
    }
  }

  async list(): Promise<MessageTemplateDto[]> {
    await this.ensureDefaults();
    const rows = await this.prisma.messageTemplate.findMany({
      orderBy: { key: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async getByKey(key: string): Promise<MessageTemplateDto | null> {
    await this.ensureDefaults();
    const row = await this.prisma.messageTemplate.findUnique({
      where: { key },
    });
    return row ? this.toDto(row) : null;
  }

  async update(
    key: string,
    input: UpdateMessageTemplateInput,
  ): Promise<MessageTemplateDto> {
    await this.ensureDefaults();
    const existing = await this.prisma.messageTemplate.findUnique({
      where: { key },
    });
    if (!existing) {
      throw new NotFoundException(`Plantilla no encontrada: ${key}`);
    }
    const contentTouched =
      input.emailSubject !== undefined ||
      input.emailBody !== undefined ||
      input.smsBody !== undefined ||
      input.label !== undefined ||
      input.channel !== undefined;

    const updated = await this.prisma.messageTemplate.update({
      where: { key },
      data: {
        label: input.label ?? existing.label,
        description:
          input.description === undefined
            ? existing.description
            : input.description,
        channel: input.channel ?? existing.channel,
        emailSubject:
          input.emailSubject === undefined
            ? existing.emailSubject
            : input.emailSubject,
        emailBody:
          input.emailBody === undefined ? existing.emailBody : input.emailBody,
        smsBody: input.smsBody === undefined ? existing.smsBody : input.smsBody,
        active:
          typeof input.active === 'boolean' ? input.active : existing.active,
        isCustomized: contentTouched ? true : existing.isCustomized,
      },
    });
    return this.toDto(updated);
  }

  /** Restaura una plantilla al seed actual (Admin). */
  async resetToDefault(key: string): Promise<MessageTemplateDto> {
    const seed = MESSAGE_TEMPLATE_SEEDS.find((item) => item.key === key);
    if (!seed) {
      throw new NotFoundException(`Seed no encontrado: ${key}`);
    }
    await this.ensureDefaults();
    const updated = await this.prisma.messageTemplate.update({
      where: { key },
      data: {
        label: seed.label,
        description: seed.description,
        channel: seed.channel,
        emailSubject: seed.emailSubject,
        emailBody: seed.emailBody,
        smsBody: seed.smsBody,
        active: seed.active !== false,
        isCustomized: false,
        seedRevision: MESSAGE_TEMPLATE_SEED_REVISION,
      },
    });
    return this.toDto(updated);
  }

  render(template: string | null | undefined, vars: Record<string, string>) {
    return renderTemplate(template, vars);
  }

  private toDto(row: {
    id: string;
    key: string;
    label: string;
    description: string | null;
    channel: string;
    emailSubject: string | null;
    emailBody: string | null;
    smsBody: string | null;
    active: boolean;
    isCustomized: boolean;
    seedRevision: number;
    updatedAt: Date;
  }): MessageTemplateDto {
    return {
      id: row.id,
      key: row.key,
      label: row.label,
      description: row.description,
      channel: row.channel,
      emailSubject: row.emailSubject,
      emailBody: row.emailBody,
      smsBody: row.smsBody,
      active: row.active,
      isCustomized: row.isCustomized,
      seedRevision: row.seedRevision,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
