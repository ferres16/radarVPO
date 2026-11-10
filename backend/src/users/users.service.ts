import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma, UserPlan, UserRole } from '@prisma/client';
import { BillingService } from '../billing/billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProAccessService } from '../common/pro-access/pro-access.service';
import { MARKETING_CONSENT_VERSION } from '../common/marketing-consent';
import { CoursesService } from '../courses/courses.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly proAccess: ProAccessService,
    private readonly coursesService: CoursesService,
    private readonly billing: BillingService,
  ) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        emailVerifiedAt: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async findByEmailWithHash(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        plan: true,
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        emailVerifiedAt: true,
        marketingOptInAt: true,
        marketingOptInVersion: true,
        marketingOptOutAt: true,
        smsAlertsEnabled: true,
        alertMunicipalityIds: true,
        alertPromotionTypes: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private asStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private toPublicProfile(
    user: {
      id: string;
      email: string;
      fullName: string;
      phone: string;
      role: UserRole;
      plan: UserPlan;
      emailVerifiedAt: Date | null;
      marketingOptInAt: Date | null;
      marketingOptInVersion?: string | null;
      marketingOptOutAt?: Date | null;
      smsAlertsEnabled: boolean;
      alertMunicipalityIds?: unknown;
      alertPromotionTypes?: unknown;
      createdAt: Date;
      lastLoginAt: Date | null;
    },
    proAccess: Awaited<ReturnType<ProAccessService['resolveForUser']>>,
  ) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      marketingOptInAt: user.marketingOptInAt?.toISOString() ?? null,
      marketingOptInVersion: user.marketingOptInVersion ?? null,
      marketingOptOutAt: user.marketingOptOutAt?.toISOString() ?? null,
      smsAlertsEnabled: user.smsAlertsEnabled,
      alertMunicipalityIds: this.asStringArray(user.alertMunicipalityIds),
      alertPromotionTypes: this.asStringArray(user.alertPromotionTypes),
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      proAccess,
    };
  }

  async getProfileWithProAccess(id: string) {
    const [user, proAccess] = await Promise.all([
      this.findById(id),
      this.proAccess.resolveForUser(id),
    ]);

    return this.toPublicProfile(user, proAccess);
  }

  async updateProfileWithProAccess(
    id: string,
    data: {
      fullName?: string | null;
      phone?: string | null;
      smsAlertsEnabled?: boolean;
      marketingOptIn?: boolean;
      alertMunicipalityIds?: string[];
      alertPromotionTypes?: Array<'venta' | 'alquiler' | 'mixto'>;
    },
  ) {
    const updated = await this.updateProfile(id, data);
    const proAccess = await this.proAccess.resolveForUser(id);

    return this.toPublicProfile(updated, proAccess);
  }

  async updateProfile(
    id: string,
    data: {
      fullName?: string | null;
      phone?: string | null;
      smsAlertsEnabled?: boolean;
      marketingOptIn?: boolean;
      alertMunicipalityIds?: string[];
      alertPromotionTypes?: Array<'venta' | 'alquiler' | 'mixto'>;
    },
  ) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: {
        fullName: true,
        phone: true,
        plan: true,
        emailVerifiedAt: true,
        smsAlertsEnabled: true,
        marketingOptInAt: true,
        marketingOptInVersion: true,
        marketingOptOutAt: true,
        alertMunicipalityIds: true,
        alertPromotionTypes: true,
      },
    });

    if (!current) {
      throw new NotFoundException('User not found');
    }

    const nextFullName =
      data.fullName === undefined ? current.fullName : (data.fullName ?? '');
    const nextPhone =
      data.phone === undefined ? current.phone : (data.phone ?? '');
    // Si un PRO verificado guarda/actualiza móvil sin tocar el toggle, activar SMS.
    const nextSms =
      typeof data.smsAlertsEnabled === 'boolean'
        ? data.smsAlertsEnabled
        : data.phone !== undefined &&
            current.plan === UserPlan.pro &&
            Boolean(current.emailVerifiedAt) &&
            nextPhone.trim()
          ? true
          : current.smsAlertsEnabled;
    const nextMarketing =
      typeof data.marketingOptIn === 'boolean'
        ? data.marketingOptIn
        : Boolean(current.marketingOptInAt);
    const nextMunicipalities =
      data.alertMunicipalityIds === undefined
        ? this.asStringArray(current.alertMunicipalityIds)
        : [
            ...new Set(
              data.alertMunicipalityIds
                .map((item) => item.trim())
                .filter(Boolean),
            ),
          ].sort();
    const nextPromotionTypes =
      data.alertPromotionTypes === undefined
        ? this.asStringArray(current.alertPromotionTypes)
        : [...new Set(data.alertPromotionTypes)].sort();

    const sameList = (a: string[], b: string[]) => {
      const left = [...a].sort();
      const right = [...b].sort();
      return (
        left.length === right.length &&
        left.every((item, index) => item === right[index])
      );
    };

    const unchanged =
      nextFullName === current.fullName &&
      nextPhone === current.phone &&
      nextSms === current.smsAlertsEnabled &&
      nextMarketing === Boolean(current.marketingOptInAt) &&
      sameList(
        nextMunicipalities,
        this.asStringArray(current.alertMunicipalityIds),
      ) &&
      sameList(
        nextPromotionTypes,
        this.asStringArray(current.alertPromotionTypes),
      );
    if (unchanged) {
      throw new BadRequestException('No hay cambios que guardar.');
    }

    if (nextSms && !nextPhone.trim()) {
      throw new BadRequestException(
        'Añade un teléfono antes de activar los SMS de avisos.',
      );
    }
    if (nextSms && !current.emailVerifiedAt) {
      throw new BadRequestException(
        'Verifica tu email antes de activar los SMS de avisos PRO.',
      );
    }

    const now = new Date();
    const marketingUpdate =
      typeof data.marketingOptIn === 'boolean'
        ? data.marketingOptIn
          ? {
              marketingOptInAt: current.marketingOptInAt ?? now,
              marketingOptInVersion: MARKETING_CONSENT_VERSION,
              marketingOptOutAt: null,
            }
          : {
              marketingOptInAt: null,
              marketingOptInVersion: null,
              marketingOptOutAt: current.marketingOptOutAt ?? now,
            }
        : {};

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        phone: data.phone ?? undefined,
        smsAlertsEnabled:
          nextSms !== current.smsAlertsEnabled ? nextSms : undefined,
        ...marketingUpdate,
        alertMunicipalityIds:
          data.alertMunicipalityIds === undefined
            ? undefined
            : nextMunicipalities,
        alertPromotionTypes:
          data.alertPromotionTypes === undefined
            ? undefined
            : nextPromotionTypes,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        plan: true,
        emailVerifiedAt: true,
        marketingOptInAt: true,
        marketingOptInVersion: true,
        marketingOptOutAt: true,
        smsAlertsEnabled: true,
        alertMunicipalityIds: true,
        alertPromotionTypes: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
  }

  async getMyCourses(id: string) {
    return this.coursesService.listAccessibleCoursesWithProgress(id);
  }

  async getAccessSummary(userId: string) {
    const [services, courses] = await Promise.all([
      this.prisma.userServiceAccess.findMany({
        where: { userId, isActive: true },
        select: {
          activatedAt: true,
          service: { select: { id: true, key: true, name: true } },
        },
      }),
      this.prisma.userCourseAccess.findMany({
        where: { userId, isActive: true },
        select: {
          activatedAt: true,
          course: { select: { id: true, slug: true, title: true } },
        },
      }),
    ]);

    return {
      services,
      courses,
    };
  }

  async exportMyData(userId: string) {
    const [
      profile,
      favorites,
      purchases,
      subscriptions,
      courseAccesses,
      consents,
    ] = await Promise.all([
      this.findById(userId),
      this.prisma.promotionFavorite.findMany({
        where: { userId },
        select: {
          stage: true,
          notes: true,
          checklistDone: true,
          createdAt: true,
          updatedAt: true,
          promotion: { select: { id: true, title: true } },
        },
      }),
      this.prisma.purchase.findMany({
        where: { userId },
        select: {
          productKey: true,
          status: true,
          amount: true,
          currency: true,
          purchasedAt: true,
          createdAt: true,
          course: { select: { title: true, slug: true } },
        },
      }),
      this.prisma.subscription.findMany({
        where: { userId },
        select: {
          planKey: true,
          status: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
          cancelAt: true,
          createdAt: true,
        },
      }),
      this.prisma.userCourseAccess.findMany({
        where: { userId },
        select: {
          isActive: true,
          activatedAt: true,
          course: { select: { title: true, slug: true } },
        },
      }),
      this.prisma.auditLog.findMany({
        where: {
          userId,
          action: {
            in: [
              'auth.register.privacy_accepted',
              'billing.checkout.terms_accepted',
            ],
          },
        },
        select: { action: true, createdAt: true, metadata: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      profile: {
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        plan: profile.plan,
        marketingOptInAt: profile.marketingOptInAt?.toISOString() ?? null,
        smsAlertsEnabled: profile.smsAlertsEnabled,
        createdAt: profile.createdAt.toISOString(),
        lastLoginAt: profile.lastLoginAt?.toISOString() ?? null,
      },
      favorites,
      purchases,
      subscriptions,
      courseAccesses,
      consents,
    };
  }

  async deleteMyAccount(userId: string) {
    return this.anonymizeAccount(userId, { actorUserId: userId });
  }

  /**
   * Supresión por anonimización: borra datos personales y de uso, pero conserva
   * compras, suscripciones y evidencias de consentimiento (obligaciones fiscales
   * y prueba de la renuncia al desistimiento) desvinculadas de la identidad.
   */
  async anonymizeAccount(
    userId: string,
    options: { actorUserId: string; allowAdmin?: boolean },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        stripeCustomerId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === UserRole.admin && !options.allowAdmin) {
      throw new BadRequestException(
        'Las cuentas de administración no se pueden eliminar desde aquí.',
      );
    }

    try {
      await this.billing.cancelStripeSubscriptionsForUser({
        userId: user.id,
        email: user.email,
        stripeCustomerId: user.stripeCustomerId,
      });
    } catch {
      // La supresión sigue: las compras se conservan para obligaciones fiscales.
    }

    const deletedAt = new Date();
    const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

    await this.prisma.$transaction([
      this.prisma.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: deletedAt },
      }),
      this.prisma.passwordResetToken.deleteMany({ where: { userId } }),
      this.prisma.emailVerificationToken.deleteMany({ where: { userId } }),
      this.prisma.waitlistLead.deleteMany({ where: { userId } }),
      this.prisma.waitlistLead.deleteMany({ where: { email: user.email } }),
      this.prisma.deliveryLog.updateMany({
        where: {
          target: { in: [user.email, ...(user.phone ? [user.phone] : [])] },
        },
        data: { target: 'deleted', content: null, subject: null },
      }),
      this.prisma.promotionFavorite.deleteMany({ where: { userId } }),
      this.prisma.savedSearch.deleteMany({ where: { userId } }),
      this.prisma.userAlert.deleteMany({ where: { userId } }),
      this.prisma.reminder.deleteMany({ where: { userId } }),
      this.prisma.userEntitlement.deleteMany({ where: { userId } }),
      this.prisma.courseProgress.deleteMany({ where: { userId } }),
      this.prisma.lessonProgress.deleteMany({ where: { userId } }),
      this.prisma.userCourseAccess.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prisma.userServiceAccess.updateMany({
        where: { userId },
        data: { isActive: false },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted.${userId}@deleted.invalid`,
          fullName: 'Cuenta eliminada',
          phone: '',
          passwordHash,
          role: UserRole.user,
          plan: UserPlan.free,
          emailVerifiedAt: null,
          alertMunicipalityIds: Prisma.DbNull,
          alertPromotionTypes: Prisma.DbNull,
          stripeCustomerId: null,
          proCancellationRequestedAt: null,
          marketingOptInAt: null,
          marketingOptInVersion: null,
          marketingOptOutAt: deletedAt,
          smsAlertsEnabled: false,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          userId: options.actorUserId === userId ? userId : options.actorUserId,
          action:
            options.actorUserId === userId
              ? 'auth.account.deleted'
              : 'admin.user.anonymized',
          entity: 'User',
          entityId: userId,
          metadata: { deletedAt: deletedAt.toISOString() },
        },
      }),
    ]);

    return {
      success: true as const,
      message:
        'Tu cuenta se ha eliminado. Conservamos los registros de compra durante los plazos legales aplicables.',
    };
  }
}
