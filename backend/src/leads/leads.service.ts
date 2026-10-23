import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { canonicalizeMunicipality } from '../common/municipality';
import { CreateInterestLeadDto } from './dto/create-interest-lead.dto';

const PRIVACY_VERSION = '2026-10';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async createInterest(dto: CreateInterestLeadDto) {
    const email = dto.email.trim().toLowerCase();
    const municipality = canonicalizeMunicipality(dto.municipality) ?? null;
    const marketingOptIn = Boolean(dto.marketingOptIn);
    const privacyVersion = dto.privacyVersion?.trim() || PRIVACY_VERSION;

    const row = await this.prisma.interestLead.upsert({
      where: {
        email_product: {
          email,
          product: dto.product,
        },
      },
      create: {
        email,
        product: dto.product,
        source: dto.source?.trim() || null,
        municipality,
        tenureInterest: dto.tenureInterest ?? null,
        searchPhase: dto.searchPhase?.trim() || null,
        marketingOptIn,
        privacyVersion,
      },
      update: {
        source: dto.source?.trim() || undefined,
        municipality: municipality ?? undefined,
        tenureInterest: dto.tenureInterest ?? undefined,
        searchPhase: dto.searchPhase?.trim() || undefined,
        marketingOptIn,
        privacyVersion,
      },
      select: {
        id: true,
        product: true,
        createdAt: true,
      },
    });

    return {
      success: true as const,
      message:
        'Te avisaremos cuando esté disponible. No hace falta crear una cuenta ahora.',
      id: row.id,
      product: row.product,
    };
  }
}
