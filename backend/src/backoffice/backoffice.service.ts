import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromotionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3StorageService } from '../storage/s3-storage.service';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpsertUnitDto } from './dto/upsert-unit.dto';

@Injectable()
export class BackofficeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async overview() {
    const [users, promotions, pendingReview, published, news, jobsFailed] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.promotion.count(),
        this.prisma.promotion.count({ where: { status: 'pending_review' } }),
        this.prisma.promotion.count({ where: { status: 'published' } }),
        this.prisma.newsItem.count(),
        this.prisma.jobRun.count({ where: { status: 'failed' } }),
      ]);

    return {
      users,
      promotions,
      pendingReview,
      published,
      news,
      jobsFailed,
    };
  }

  async jobs() {
    return this.prisma.jobRun.findMany({
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }

  async failures() {
    return this.prisma.deliveryFailure.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async listPromotions(status?: string) {
    const where: Prisma.PromotionWhereInput = {
      status: this.validStatus(status) ?? undefined,
    };

    return this.prisma.promotion.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        documents: true,
        units: {
          orderBy: { rowOrder: 'asc' },
          take: 3,
        },
      },
      take: 200,
    });
  }

  async getPromotion(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        units: { orderBy: { rowOrder: 'asc' } },
      },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  async previewPromotion(promotionId: string) {
    const promotion = await this.getPromotion(promotionId);
    return {
      id: promotion.id,
      title: promotion.title,
      status: promotion.status,
      promotionType: promotion.promotionType,
      municipality: promotion.municipality,
      province: promotion.province,
      promoter: promotion.promoter,
      totalHomes: promotion.totalHomes,
      publicDescription:
        promotion.publicDescription ||
        'Estamos analizando esta promocion y actualizando la informacion.',
      availableUnitsText: promotion.availableUnitsText,
      importantDates: promotion.importantDates,
      requirements: promotion.requirements,
      economicInfo: promotion.economicInfo,
      contactInfo: promotion.contactInfo,
      feesAndReservations: promotion.feesAndReservations,
      units: promotion.units,
      documents: promotion.documents,
    };
  }

  async updatePromotion(promotionId: string, dto: UpdatePromotionDto) {
    await this.ensurePromotion(promotionId);

    const data: Prisma.PromotionUpdateInput = {
      title: dto.title,
      location: dto.location,
      municipality: dto.municipality,
      province: dto.province,
      promotionType: dto.promotionType,
      promoter: dto.promoter,
      totalHomes: dto.totalHomes,
      publicDescription: dto.publicDescription,
      availableUnitsText: dto.availableUnitsText,
      statusMessage: dto.statusMessage,
      importantDates: this.parseJsonField(dto.importantDatesJson),
      requirements: this.parseJsonField(dto.requirementsJson),
      economicInfo: this.parseJsonField(dto.economicInfoJson),
      feesAndReservations: this.parseJsonField(dto.feesAndReservationsJson),
      contactInfo: this.parseJsonField(dto.contactInfoJson),
    };

    return this.prisma.promotion.update({
      where: { id: promotionId },
      data,
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        units: { orderBy: { rowOrder: 'asc' } },
      },
    });
  }

  async updatePromotionStatus(
    promotionId: string,
    dto: UpdatePromotionStatusDto,
  ) {
    await this.ensurePromotion(promotionId);

    return this.prisma.promotion.update({
      where: { id: promotionId },
      data: {
        status: dto.status,
      },
    });
  }

  async createUnit(promotionId: string, dto: UpsertUnitDto) {
    await this.ensurePromotion(promotionId);

    const maxOrder = await this.prisma.promotionUnit.aggregate({
      where: { promotionId },
      _max: { rowOrder: true },
    });

    return this.prisma.promotionUnit.create({
      data: {
        ...this.mapUnitCreatePayload(promotionId, dto),
        rowOrder: dto.rowOrder ?? (maxOrder._max.rowOrder ?? -1) + 1,
      },
    });
  }

  async updateUnit(promotionId: string, unitId: string, dto: UpsertUnitDto) {
    await this.ensureUnit(promotionId, unitId);

    return this.prisma.promotionUnit.update({
      where: { id: unitId },
      data: this.mapUnitPayload(dto),
    });
  }

  async deleteUnit(promotionId: string, unitId: string) {
    await this.ensureUnit(promotionId, unitId);
    await this.prisma.promotionUnit.delete({ where: { id: unitId } });
    return { deleted: true };
  }

  async duplicateUnit(promotionId: string, unitId: string) {
    const existing = await this.ensureUnit(promotionId, unitId);
    const maxOrder = await this.prisma.promotionUnit.aggregate({
      where: { promotionId },
      _max: { rowOrder: true },
    });

    return this.prisma.promotionUnit.create({
      data: {
        promotionId,
        rowOrder: (maxOrder._max.rowOrder ?? 0) + 1,
        unitLabel: existing.unitLabel,
        building: existing.building,
        stair: existing.stair,
        floor: existing.floor,
        door: existing.door,
        bedrooms: existing.bedrooms,
        bathrooms: existing.bathrooms,
        usefulAreaM2: existing.usefulAreaM2,
        builtAreaM2: existing.builtAreaM2,
        priceSale: existing.priceSale,
        monthlyRent: existing.monthlyRent,
        reservation: existing.reservation,
        notes: existing.notes,
        extraData:
          existing.extraData === null
            ? undefined
            : (existing.extraData as Prisma.InputJsonValue),
      },
    });
  }

  async reorderUnits(promotionId: string, unitIds: string[]) {
    await this.ensurePromotion(promotionId);

    const existing = await this.prisma.promotionUnit.findMany({
      where: { promotionId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((item) => item.id));

    if (unitIds.some((id) => !existingIds.has(id))) {
      throw new BadRequestException('Some unit ids do not belong to this promotion');
    }

    await this.prisma.$transaction(
      unitIds.map((unitId, index) =>
        this.prisma.promotionUnit.update({
          where: { id: unitId },
          data: { rowOrder: index },
        }),
      ),
    );

    return this.prisma.promotionUnit.findMany({
      where: { promotionId },
      orderBy: { rowOrder: 'asc' },
    });
  }

  async importUnitsFromPaste(promotionId: string, text: string) {
    await this.ensurePromotion(promotionId);

    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      throw new BadRequestException('Paste must include header and at least one row');
    }

    const delimiter = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(delimiter).map((value) => value.trim().toLowerCase());
    const rows = lines.slice(1).map((line) =>
      line.split(delimiter).map((value) => value.trim()),
    );

    const created = await this.prisma.$transaction(
      rows.map((cells, index) => {
        const get = (name: string) => {
          const position = headers.indexOf(name);
          if (position < 0) return undefined;
          return cells[position];
        };

        const parseNumber = (value?: string) => {
          if (!value) return undefined;
          const normalized = value.replace(/\./g, '').replace(',', '.');
          const parsed = Number(normalized);
          return Number.isNaN(parsed) ? undefined : parsed;
        };

        return this.prisma.promotionUnit.create({
          data: {
            promotionId,
            rowOrder: index,
            unitLabel: get('unitlabel') || get('unidad') || get('label'),
            building: get('building') || get('bloque'),
            stair: get('stair') || get('escalera'),
            floor: get('floor') || get('planta'),
            door: get('door') || get('puerta'),
            bedrooms: parseNumber(get('bedrooms') || get('habitaciones')),
            bathrooms: parseNumber(get('bathrooms') || get('banos')),
            usefulAreaM2: parseNumber(get('usefulaream2') || get('m2utiles')),
            builtAreaM2: parseNumber(get('builtaream2') || get('m2construidos')),
            priceSale: parseNumber(get('pricesale') || get('precioventa')),
            monthlyRent: parseNumber(get('monthlyrent') || get('alquilermensual')),
            reservation: parseNumber(get('reservation') || get('reserva')),
            notes: get('notes') || get('observaciones'),
          },
        });
      }),
    );

    return { imported: created.length, rows: created };
  }

  async uploadDocument(
    promotionId: string,
    dto: UploadDocumentDto,
    file: Express.Multer.File,
  ) {
    await this.ensurePromotion(promotionId);

    if (!file?.buffer || !file.originalname) {
      throw new BadRequestException('File is required');
    }

    const upload = await this.storage.upload({
      folder: `promotions/${promotionId}`,
      fileName: file.originalname,
      contentType: file.mimetype || 'application/octet-stream',
      content: file.buffer,
    });

    return this.prisma.promotionDocument.create({
      data: {
        promotionId,
        documentKind: dto.documentKind,
        fileType: file.mimetype || 'application/octet-stream',
        originalName: file.originalname,
        storagePath: upload.key,
        publicUrl: upload.url,
        uploadedBy: 'admin',
      },
    });
  }

  private parseJsonField(value?: string): Prisma.InputJsonValue | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (!value.trim()) {
      return undefined;
    }

    try {
      return JSON.parse(value) as Prisma.InputJsonValue;
    } catch {
      throw new BadRequestException('Invalid JSON block in request body');
    }
  }

  private mapUnitPayload(dto: UpsertUnitDto): Prisma.PromotionUnitUpdateInput {
    return {
      rowOrder: dto.rowOrder,
      unitLabel: dto.unitLabel,
      building: dto.building,
      stair: dto.stair,
      floor: dto.floor,
      door: dto.door,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      usefulAreaM2: dto.usefulAreaM2,
      builtAreaM2: dto.builtAreaM2,
      priceSale: dto.priceSale,
      monthlyRent: dto.monthlyRent,
      reservation: dto.reservation,
      notes: dto.notes,
      extraData: dto.extraData as Prisma.InputJsonValue | undefined,
    };
  }

  private mapUnitCreatePayload(
    promotionId: string,
    dto: UpsertUnitDto,
  ): Prisma.PromotionUnitUncheckedCreateInput {
    return {
      promotionId,
      rowOrder: dto.rowOrder ?? 0,
      unitLabel: dto.unitLabel,
      building: dto.building,
      stair: dto.stair,
      floor: dto.floor,
      door: dto.door,
      bedrooms: dto.bedrooms,
      bathrooms: dto.bathrooms,
      usefulAreaM2: dto.usefulAreaM2,
      builtAreaM2: dto.builtAreaM2,
      priceSale: dto.priceSale,
      monthlyRent: dto.monthlyRent,
      reservation: dto.reservation,
      notes: dto.notes,
      extraData: dto.extraData as Prisma.InputJsonValue | undefined,
    };
  }

  private async ensurePromotion(promotionId: string) {
    const promotion = await this.prisma.promotion.findUnique({
      where: { id: promotionId },
      select: { id: true },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    return promotion;
  }

  private async ensureUnit(promotionId: string, unitId: string) {
    const unit = await this.prisma.promotionUnit.findFirst({
      where: { id: unitId, promotionId },
    });

    if (!unit) {
      throw new NotFoundException('Unit row not found');
    }

    return unit;
  }

  private validStatus(input?: string): PromotionStatus | null {
    if (!input) {
      return null;
    }

    const allowed: PromotionStatus[] = [
      'detected',
      'pending_review',
      'published',
      'archived',
    ];

    return allowed.includes(input as PromotionStatus)
      ? (input as PromotionStatus)
      : null;
  }
}
