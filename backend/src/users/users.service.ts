import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UserPlan, UserRole } from '@prisma/client';
import { BillingService } from '../billing/billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProAccessService } from '../common/pro-access/pro-access.service';
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
        smsAlertsEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfileWithProAccess(id: string) {
    const [user, proAccess] = await Promise.all([
      this.findById(id),
      this.proAccess.resolveForUser(id),
    ]);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      marketingOptInAt: user.marketingOptInAt?.toISOString() ?? null,
      smsAlertsEnabled: user.smsAlertsEnabled,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
      proAccess,
    };
  }

  async updateProfileWithProAccess(
    id: string,
    data: {
      fullName?: string | null;
      phone?: string | null;
      smsAlertsEnabled?: boolean;
      marketingOptIn?: boolean;
    },
  ) {
    const updated = await this.updateProfile(id, data);
    const proAccess = await this.proAccess.resolveForUser(id);

    return {
      id: updated.id,
      email: updated.email,
      fullName: updated.fullName,
      phone: updated.phone,
      role: updated.role,
      plan: updated.plan,
      emailVerifiedAt: updated.emailVerifiedAt?.toISOString() ?? null,
      marketingOptInAt: updated.marketingOptInAt?.toISOString() ?? null,
      smsAlertsEnabled: updated.smsAlertsEnabled,
      createdAt: updated.createdAt.toISOString(),
      lastLoginAt: updated.lastLoginAt?.toISOString() ?? null,
      proAccess,
    };
  }

  async updateProfile(
    id: string,
    data: {
      fullName?: string | null;
      phone?: string | null;
      smsAlertsEnabled?: boolean;
      marketingOptIn?: boolean;
    },
  ) {
    const current = await this.prisma.user.findUnique({
      where: { id },
      select: {
        fullName: true,
        phone: true,
        smsAlertsEnabled: true,
        marketingOptInAt: true,
      },
    });

    if (!current) {
      throw new NotFoundException('User not found');
    }

    const nextFullName =
      data.fullName === undefined ? current.fullName : (data.fullName ?? '');
    const nextPhone =
      data.phone === undefined ? current.phone : (data.phone ?? '');
    const nextSms =
      typeof data.smsAlertsEnabled === 'boolean'
        ? data.smsAlertsEnabled
        : current.smsAlertsEnabled;
    const nextMarketing =
      typeof data.marketingOptIn === 'boolean'
        ? data.marketingOptIn
        : Boolean(current.marketingOptInAt);

    const unchanged =
      nextFullName === current.fullName &&
      nextPhone === current.phone &&
      nextSms === current.smsAlertsEnabled &&
      nextMarketing === Boolean(current.marketingOptInAt);
    if (unchanged) {
      throw new BadRequestException('No hay cambios que guardar.');
    }

    if (nextSms && !nextPhone.trim()) {
      throw new BadRequestException(
        'Añade un teléfono antes de activar los SMS de avisos.',
      );
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName ?? undefined,
        phone: data.phone ?? undefined,
        smsAlertsEnabled:
          typeof data.smsAlertsEnabled === 'boolean'
            ? data.smsAlertsEnabled
            : undefined,
        marketingOptInAt:
          typeof data.marketingOptIn === 'boolean'
            ? data.marketingOptIn
              ? (current.marketingOptInAt ?? new Date())
              : null
            : undefined,
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
        smsAlertsEnabled: true,
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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        stripeCustomerId: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.role === UserRole.admin) {
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
          plan: UserPlan.free,
          stripeCustomerId: null,
          proCancellationRequestedAt: null,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          userId,
          action: 'auth.account.deleted',
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
