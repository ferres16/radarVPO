import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistLeadDto } from './dto/create-waitlist-lead.dto';

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async join(dto: CreateWaitlistLeadDto, userId?: string) {
    if (!dto.waitlistConsent) {
      throw new BadRequestException(
        'Debes aceptar el aviso de lista de espera para continuar.',
      );
    }

    const email = dto.email.trim().toLowerCase();
    const municipality = dto.municipality?.trim() || null;
    const now = new Date();

    const lead = await this.prisma.waitlistLead.upsert({
      where: {
        email_product: {
          email,
          product: dto.product,
        },
      },
      create: {
        email,
        product: dto.product,
        municipality,
        waitlistConsentAt: now,
        marketingConsentAt: dto.marketingConsent ? now : null,
        sourcePath: dto.sourcePath?.trim() || null,
        userId: userId || null,
      },
      update: {
        municipality,
        waitlistConsentAt: now,
        marketingConsentAt: dto.marketingConsent
          ? now
          : undefined,
        sourcePath: dto.sourcePath?.trim() || undefined,
        userId: userId || undefined,
      },
      select: {
        id: true,
        email: true,
        product: true,
        municipality: true,
        createdAt: true,
      },
    });

    return {
      ok: true,
      message:
        'Te hemos apuntado a la lista de espera. Te avisaremos cuando la venta esté disponible.',
      lead,
    };
  }
}
