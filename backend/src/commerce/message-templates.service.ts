import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MESSAGE_TEMPLATE_SEEDS } from './message-templates.defaults';

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
      await this.prisma.messageTemplate.upsert({
        where: { key: seed.key },
        create: {
          key: seed.key,
          label: seed.label,
          description: seed.description,
          channel: seed.channel,
          emailSubject: seed.emailSubject,
          emailBody: seed.emailBody,
          smsBody: seed.smsBody,
          active: true,
        },
        update: {},
      });
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
      },
    });
    return this.toDto(updated);
  }

  /** Sustituye {{var}} en plantillas. */
  render(
    template: string | null | undefined,
    vars: Record<string, string>,
  ): string {
    if (!template) return '';
    return template.replace(
      /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
      (_, name: string) => {
        return vars[name] ?? '';
      },
    );
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
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
