import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, PromotionStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3StorageService } from '../storage/s3-storage.service';
import { CreateCourseAccessRuleDto } from './dto/create-course-access-rule.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateCourseLessonDto } from './dto/create-course-lesson.dto';
import { CreateCourseModuleDto } from './dto/create-course-module.dto';
import { CreateNewsItemDto } from './dto/create-news-item.dto';
import { UpdateBackofficeNewsItemDto } from './dto/update-backoffice-news-item.dto';
import { UpdateCourseAccessRuleDto } from './dto/update-course-access-rule.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UpdateCourseLessonDto } from './dto/update-course-lesson.dto';
import { UpdateCourseModuleDto } from './dto/update-course-module.dto';
import { UpdatePromotionStatusDto } from './dto/update-promotion-status.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadCourseAssetDto } from './dto/upload-course-asset.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpsertUnitDto } from './dto/upsert-unit.dto';

@Injectable()
export class BackofficeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: S3StorageService,
  ) {}

  async overview() {
    const [users, promotions, pendingReview, publishedUnreviewed, publishedReviewed, news, jobsFailed] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.promotion.count(),
        this.prisma.promotion.count({ where: { status: 'pending_review' } }),
        this.prisma.promotion.count({ where: { status: 'published_unreviewed' } }),
        this.prisma.promotion.count({ where: { status: 'published_reviewed' } }),
        this.prisma.newsItem.count(),
        this.prisma.jobRun.count({ where: { status: 'failed' } }),
      ]);

    return {
      users,
      promotions,
      pendingReview,
      publishedUnreviewed,
      publishedReviewed,
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

  async listUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (existing.role === UserRole.admin && dto.role === UserRole.user) {
      const admins = await this.prisma.user.count({
        where: { role: UserRole.admin },
      });
      if (admins <= 1) {
        throw new BadRequestException('Cannot demote the only admin user');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        plan: dto.plan,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        plan: true,
        createdAt: true,
      },
    });
  }

  async listNews() {
    return this.prisma.newsItem.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 300,
    });
  }

  async listCourses() {
    return this.prisma.course.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        modules: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            lessons: {
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
        accessRules: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        slug: dto.slug,
        title: dto.title,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        coverImage: dto.coverImage,
        status: dto.status,
        accessType: dto.accessType,
        order: dto.order ?? 0,
      },
    });
  }

  async updateCourse(courseId: string, dto: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id: courseId },
      data: {
        slug: dto.slug,
        title: dto.title,
        shortDescription: dto.shortDescription,
        longDescription: dto.longDescription,
        coverImage: dto.coverImage,
        status: dto.status,
        accessType: dto.accessType,
        order: dto.order,
      },
    });
  }

  async deleteCourse(courseId: string) {
    await this.prisma.course.delete({ where: { id: courseId } });
    return { deleted: true };
  }

  async createCourseModule(courseId: string, dto: CreateCourseModuleDto) {
    await this.ensureCourse(courseId);

    return this.prisma.courseModule.create({
      data: {
        courseId,
        title: dto.title,
        description: dto.description,
        order: dto.order ?? 0,
        visibility: dto.visibility,
      },
    });
  }

  async reorderCourseModules(courseId: string, moduleIds: string[]) {
    const modules = await this.prisma.courseModule.findMany({
      where: { id: { in: moduleIds }, courseId },
      select: { id: true },
    });

    if (modules.length !== moduleIds.length) {
      throw new BadRequestException('Some modules do not belong to this course');
    }

    await this.prisma.$transaction(
      moduleIds.map((id, index) =>
        this.prisma.courseModule.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.courseModule.findMany({
      where: { courseId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async updateCourseModule(moduleId: string, dto: UpdateCourseModuleDto) {
    return this.prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        title: dto.title,
        description: dto.description,
        order: dto.order,
        visibility: dto.visibility,
      },
    });
  }

  async deleteCourseModule(moduleId: string) {
    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    return { deleted: true };
  }

  async createCourseLesson(moduleId: string, dto: CreateCourseLessonDto) {
    const module = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      select: { id: true, courseId: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return this.prisma.courseLesson.create({
      data: {
        courseId: module.courseId,
        moduleId: module.id,
        title: dto.title,
        slug: dto.slug,
        contentJson: dto.contentJson,
        order: dto.order ?? 0,
        durationMinutes: dto.durationMinutes,
        status: dto.status,
        type: dto.type,
      },
    });
  }

  async reorderCourseLessons(moduleId: string, lessonIds: string[]) {
    const lessons = await this.prisma.courseLesson.findMany({
      where: { id: { in: lessonIds }, moduleId },
      select: { id: true },
    });

    if (lessons.length !== lessonIds.length) {
      throw new BadRequestException('Some lessons do not belong to this module');
    }

    await this.prisma.$transaction(
      lessonIds.map((id, index) =>
        this.prisma.courseLesson.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );

    return this.prisma.courseLesson.findMany({
      where: { moduleId },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async updateCourseLesson(lessonId: string, dto: UpdateCourseLessonDto) {
    return this.prisma.courseLesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title,
        slug: dto.slug,
        contentJson: dto.contentJson,
        order: dto.order,
        durationMinutes: dto.durationMinutes,
        status: dto.status,
        type: dto.type,
      },
    });
  }

  async deleteCourseLesson(lessonId: string) {
    await this.prisma.courseLesson.delete({ where: { id: lessonId } });
    return { deleted: true };
  }

  async uploadCourseResource(lessonId: string, dto: UploadCourseAssetDto, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const lesson = await this.prisma.courseLesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, moduleId: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const upload = await this.storage.upload({
      folder: `courses/${lesson.courseId}/${lessonId}`,
      fileName: file.originalname,
      contentType: file.mimetype,
      content: file.buffer,
    });

    return this.prisma.courseResource.create({
      data: {
        courseId: lesson.courseId,
        moduleId: lesson.moduleId,
        lessonId: lesson.id,
        kind: dto.kind,
        fileType: file.mimetype,
        originalName: file.originalname,
        storagePath: upload.key,
        publicUrl: upload.url,
      },
    });
  }

  async createCourseAccessRule(courseId: string, dto: CreateCourseAccessRuleDto) {
    await this.ensureCourse(courseId);
    return this.prisma.courseAccessRule.create({
      data: {
        courseId,
        ruleType: dto.ruleType,
        configJson: dto.configJson,
      },
    });
  }

  async updateCourseAccessRule(ruleId: string, dto: UpdateCourseAccessRuleDto) {
    return this.prisma.courseAccessRule.update({
      where: { id: ruleId },
      data: {
        ruleType: dto.ruleType,
        configJson: dto.configJson,
      },
    });
  }

  async deleteCourseAccessRule(ruleId: string) {
    await this.prisma.courseAccessRule.delete({ where: { id: ruleId } });
    return { deleted: true };
  }

  async createNews(dto: CreateNewsItemDto) {
    const token = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const itemUrl = dto.itemUrl ?? `${dto.sourceUrl.replace(/\/$/, '')}#manual-${token}`;
    const slug = this.buildSlug(dto.title, token);

    return this.prisma.newsItem.create({
      data: {
        slug,
        sourceName: dto.sourceName,
        sourceUrl: dto.sourceUrl,
        itemUrl,
        title: dto.title,
        rawText: dto.rawText,
        summary: dto.summary,
        body: dto.body,
        practicalImpact: dto.practicalImpact,
        topic: dto.topic,
        relevance: dto.relevance,
        category: 'general',
        contentHash: `manual-${token}`,
        publishedAt: new Date(dto.publishedAt),
      },
    });
  }

  async updateNews(newsId: string, dto: UpdateBackofficeNewsItemDto) {
    const existing = await this.ensureNews(newsId);
    const nextSlug = dto.title ? this.buildSlug(dto.title, existing.slug || existing.id) : existing.slug;

    return this.prisma.newsItem.update({
      where: { id: newsId },
      data: {
        slug: nextSlug ?? undefined,
        title: dto.title,
        sourceName: dto.sourceName,
        sourceUrl: dto.sourceUrl,
        rawText: dto.rawText,
        summary: dto.summary,
        body: dto.body,
        practicalImpact: dto.practicalImpact,
        topic: dto.topic,
        relevance: dto.relevance,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : undefined,
      },
    });
  }

  async deleteNews(newsId: string) {
    await this.ensureNews(newsId);
    await this.prisma.newsItem.delete({ where: { id: newsId } });
    return { deleted: true };
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
      importantDates: this.parseJsonField(dto.importantDatesJson) as Prisma.InputJsonValue | undefined,
      requirements: this.parseJsonField(dto.requirementsJson) as Prisma.InputJsonValue | undefined,
      economicInfo: this.parseJsonField(dto.economicInfoJson) as Prisma.InputJsonValue | undefined,
      feesAndReservations: this.parseJsonField(dto.feesAndReservationsJson) as Prisma.InputJsonValue | undefined,
      contactInfo: this.parseJsonField(dto.contactInfoJson) as Prisma.InputJsonValue | undefined,
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

  async deleteAllUnits(promotionId: string) {
    await this.ensurePromotion(promotionId);
    const deleted = await this.prisma.promotionUnit.deleteMany({
      where: { promotionId },
    });
    return { deleted: true, count: deleted.count };
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
    const normalizeHeader = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');
    const headers = lines[0].split(delimiter).map((value) => normalizeHeader(value));
    const rows = lines.slice(1).map((line) =>
      line.split(delimiter).map((value) => value.trim()),
    );

    const created = await this.prisma.$transaction(
      rows.map((cells, index) => {
        const get = (...names: string[]) => {
          for (const name of names) {
            const position = headers.indexOf(name);
            if (position >= 0) {
              return cells[position];
            }
          }
          return undefined;
        };

        const parseNumber = (value?: string) => {
          if (!value) return undefined;
          const normalized = value.replace(/\./g, '').replace(',', '.');
          const parsed = Number(normalized);
          return Number.isNaN(parsed) ? undefined : parsed;
        };

        const rawExtraData = {
          regUs: get('regus', 'regimus', 'regimenuso', 'regimus'),
          tip: get('tip', 'tipologia', 'tipus'),
          em: get('em', 'entradacomedor', 'entrada', 'comedor'),
          h6sh8: get('6sh8', 'h6sh8'),
          h8sh12: get('8sh12', 'h8sh12'),
          hgt12: get('h12', 'hgt12'),
          c: get('c', 'cocina', 'cuina'),
          ch: get('ch'),
          emc: get('emc', 'emc'),
          otrasPiezas: get('otraspiezas', 'altrespeces'),
          ocupacionMaxima: get('ocupacionmaxima', 'ocupmaxima', 'ocupmax', 'ocupaciomaxima', 'ocupmaxima'),
        };
        const cleanedExtraData = Object.fromEntries(
          Object.entries(rawExtraData).filter(([, value]) => value !== undefined && value !== ''),
        );

        return this.prisma.promotionUnit.create({
          data: {
            promotionId,
            rowOrder: index,
            unitLabel: get('unitlabel', 'unidad', 'label', 'ord', 'ordre'),
            building: get('building', 'bloque', 'edificio'),
            stair: get('stair', 'escalera', 'esc'),
            floor: get('floor', 'planta', 'pla'),
            door: get('door', 'puerta', 'por'),
            bedrooms: parseNumber(get('bedrooms', 'habitaciones', 'hab', 'h')),
            bathrooms: parseNumber(get('bathrooms', 'banos', 'banys')),
            usefulAreaM2: parseNumber(get('usefulaream2', 'm2utiles', 'suputilinterior')),
            builtAreaM2: parseNumber(get('builtaream2', 'm2construidos', 'supcompres')),
            priceSale: parseNumber(get('pricesale', 'precioventa', 'pvmaxim', 'pvmax')), 
            monthlyRent: parseNumber(get('monthlyrent', 'alquilermensual', 'lloguermensual')),
            reservation: parseNumber(get('reservation', 'reserva')),
            notes: get('notes', 'observaciones', 'altrespeces'),
            extraData:
              Object.keys(cleanedExtraData).length > 0
                ? (cleanedExtraData as Prisma.InputJsonValue)
                : undefined,
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

  private async ensureCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return course;
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

  private buildSlug(title: string, suffix: string) {
    return `${title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)}-${suffix.slice(0, 8)}`;
  }

  private async ensureNews(newsId: string) {
    const item = await this.prisma.newsItem.findUnique({
      where: { id: newsId },
      select: { id: true, slug: true },
    });

    if (!item) {
      throw new NotFoundException('News item not found');
    }

    return item;
  }

  private validStatus(input?: string): PromotionStatus | null {
    if (!input) {
      return null;
    }

    const allowed: PromotionStatus[] = [
      'pending_review',
      'published_unreviewed',
      'published_reviewed',
      'archived',
    ];

    return allowed.includes(input as PromotionStatus)
      ? (input as PromotionStatus)
      : null;
  }
}
