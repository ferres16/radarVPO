import { Injectable } from '@nestjs/common';
import { SubscriptionStatus, UserPlan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  ProAccessSnapshot,
  ProSubscriptionDisplayStatus,
} from './pro-access.types';

const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.active,
  SubscriptionStatus.trialing,
];

@Injectable()
export class ProAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveForUser(userId: string): Promise<ProAccessSnapshot> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        createdAt: true,
        stripeCustomerId: true,
        proCancellationRequestedAt: true,
        subscriptions: {
          where: { planKey: 'pro' },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            status: true,
            createdAt: true,
            currentPeriodEnd: true,
            cancelAt: true,
          },
        },
      },
    });

    if (!user) {
      return this.emptySnapshot();
    }

    const subscription = user.subscriptions[0] ?? null;
    const hasPlanPro = user.plan === UserPlan.pro;
    const hasActiveSubscription =
      subscription !== null &&
      ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);
    const hasAccess = hasPlanPro || hasActiveSubscription;

    const status = this.resolveDisplayStatus({
      hasAccess,
      plan: user.plan,
      subscription,
      cancellationRequestedAt: user.proCancellationRequestedAt,
    });

    const activatedAt =
      subscription?.createdAt?.toISOString() ??
      (hasPlanPro ? user.createdAt.toISOString() : null);

    const nextRenewalAt =
      subscription?.currentPeriodEnd &&
      (hasActiveSubscription || subscription.cancelAt)
        ? subscription.currentPeriodEnd.toISOString()
        : null;

    const canManageViaStripe = Boolean(user.stripeCustomerId);

    return {
      hasAccess,
      status,
      activatedAt,
      nextRenewalAt,
      cancellationRequestedAt:
        user.proCancellationRequestedAt?.toISOString() ?? null,
      canManageViaStripe,
      managementMethod: canManageViaStripe
        ? 'stripe_portal'
        : hasAccess
          ? 'manual_request'
          : null,
    };
  }

  private resolveDisplayStatus(input: {
    hasAccess: boolean;
    plan: UserPlan;
    subscription: {
      status: SubscriptionStatus;
      cancelAt: Date | null;
    } | null;
    cancellationRequestedAt: Date | null;
  }): ProSubscriptionDisplayStatus {
    if (input.cancellationRequestedAt && input.hasAccess) {
      return 'cancel_pending';
    }

    if (input.subscription) {
      if (
        input.subscription.cancelAt &&
        ACTIVE_SUBSCRIPTION_STATUSES.includes(input.subscription.status)
      ) {
        return 'cancel_pending';
      }

      if (ACTIVE_SUBSCRIPTION_STATUSES.includes(input.subscription.status)) {
        return 'active';
      }

      if (input.subscription.status === SubscriptionStatus.canceled) {
        return input.hasAccess ? 'cancel_pending' : 'canceled';
      }

      if (
        input.subscription.status === SubscriptionStatus.expired ||
        input.subscription.status === SubscriptionStatus.past_due
      ) {
        return 'expired';
      }
    }

    if (input.hasAccess || input.plan === UserPlan.pro) {
      return 'active';
    }

    return 'inactive';
  }

  private emptySnapshot(): ProAccessSnapshot {
    return {
      hasAccess: false,
      status: 'inactive',
      activatedAt: null,
      nextRenewalAt: null,
      cancellationRequestedAt: null,
      canManageViaStripe: false,
      managementMethod: null,
    };
  }
}
