import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SubscriptionStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

function getSubscriptionPeriodEnd(subscription: {
  current_period_end?: number;
  items?: { data?: Array<{ current_period_end?: number }> };
}): number | undefined {
  return (
    subscription.current_period_end ??
    subscription.items?.data?.[0]?.current_period_end
  );
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
  ) {}

  async createPortalSession(userId: string): Promise<{ url: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
      throw new BadRequestException(
        'No hay una suscripción de Stripe vinculada a tu cuenta.',
      );
    }

    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new ServiceUnavailableException(
        'La gestión de suscripción no está disponible en este momento.',
      );
    }

    const returnUrl =
      this.config.get<string>('STRIPE_PORTAL_RETURN_URL') ||
      this.config.get<string>('FRONTEND_URL') ||
      'http://localhost:3000/account';

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey);

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${returnUrl.replace(/\/$/, '')}/account`,
    });

    if (!session.url) {
      throw new ServiceUnavailableException(
        'No se pudo crear la sesión del portal de Stripe.',
      );
    }

    return { url: session.url };
  }

  async requestCancellation(userId: string): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        fullName: true,
        phone: true,
        plan: true,
        proCancellationRequestedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    if (user.plan !== 'pro') {
      throw new BadRequestException(
        'No tienes una suscripción VPO PRO activa.',
      );
    }

    if (user.proCancellationRequestedAt) {
      throw new BadRequestException(
        'Ya has solicitado la cancelación de tu suscripción.',
      );
    }

    const requestedAt = new Date();
    await this.prisma.user.update({
      where: { id: userId },
      data: { proCancellationRequestedAt: requestedAt },
    });

    try {
      const result = await this.notifications.notifyAdminsOfProCancellation({
        userId,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        requestedAt,
      });
      if (!result.sent) {
        this.logger.warn(
          `Cancellation stored for ${user.email} but admin email was not sent`,
        );
      }
    } catch (error) {
      this.logger.warn(
        `Cancellation stored for ${user.email} but admin email failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return { success: true };
  }

  async withdrawCancellation(userId: string): Promise<{ success: true }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        proCancellationRequestedAt: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado.');
    }

    if (user.plan !== 'pro' || !user.proCancellationRequestedAt) {
      throw new BadRequestException(
        'No hay ninguna solicitud de cancelación pendiente.',
      );
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { proCancellationRequestedAt: null },
    });

    return { success: true };
  }

  async cancelStripeSubscriptionsForUser(input: {
    userId: string;
    email: string;
    stripeCustomerId: string | null;
  }): Promise<{
    attempted: boolean;
    canceled: number;
    customerId: string | null;
    periodEnd: string | null;
    skippedReason?: string;
  }> {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      return {
        attempted: false,
        canceled: 0,
        customerId: input.stripeCustomerId,
        periodEnd: null,
        skippedReason: 'missing_stripe_key',
      };
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(secretKey);

    let customerId = input.stripeCustomerId?.trim() || null;
    if (!customerId) {
      const matches = await stripe.customers.list({
        email: input.email,
        limit: 3,
      });
      customerId = matches.data[0]?.id ?? null;
      if (customerId) {
        await this.prisma.user.update({
          where: { id: input.userId },
          data: { stripeCustomerId: customerId },
        });
      }
    }

    if (!customerId) {
      return {
        attempted: false,
        canceled: 0,
        customerId: null,
        periodEnd: null,
        skippedReason: 'stripe_customer_not_found',
      };
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    });

    const cancelable = subscriptions.data.filter((subscription) =>
      ['active', 'trialing', 'past_due', 'unpaid'].includes(subscription.status),
    );

    if (cancelable.length === 0) {
      return {
        attempted: true,
        canceled: 0,
        customerId,
        periodEnd: null,
        skippedReason: 'no_active_subscription',
      };
    }

    let latestPeriodEnd: string | null = null;
    for (const subscription of cancelable) {
      const updated = subscription.cancel_at_period_end
        ? subscription
        : await stripe.subscriptions.update(subscription.id, {
            cancel_at_period_end: true,
          });
      const periodEndUnix = getSubscriptionPeriodEnd(updated);
      const periodEnd = periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null;
      if (periodEnd && (!latestPeriodEnd || periodEnd > latestPeriodEnd)) {
        latestPeriodEnd = periodEnd;
      }
    }

    await this.prisma.subscription.updateMany({
      where: {
        userId: input.userId,
        planKey: 'pro',
        status: {
          in: [SubscriptionStatus.active, SubscriptionStatus.trialing],
        },
      },
      data: {
        status: SubscriptionStatus.canceled,
        cancelAt: latestPeriodEnd ? new Date(latestPeriodEnd) : new Date(),
      },
    });

    return {
      attempted: true,
      canceled: cancelable.length,
      customerId,
      periodEnd: latestPeriodEnd,
    };
  }
}
