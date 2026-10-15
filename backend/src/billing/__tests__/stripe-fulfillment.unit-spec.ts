import { SubscriptionStatus } from '@prisma/client';
import {
  amountToCents,
  centsToAmount,
  extractSubscriptionPeriod,
  mapStripeSubscriptionStatus,
  parseCheckoutMetadata,
  shouldKeepProPlan,
} from '../stripe-fulfillment';

describe('parseCheckoutMetadata', () => {
  it('reads a PRO checkout using client_reference_id as the user', () => {
    expect(parseCheckoutMetadata({ product: 'pro' }, 'user_1')).toEqual({
      userId: 'user_1',
      product: 'pro',
    });
  });

  it('requires a course id for course checkouts', () => {
    expect(parseCheckoutMetadata({ product: 'course', userId: 'u' })).toBeNull();
    expect(
      parseCheckoutMetadata({
        product: 'course',
        userId: 'u',
        courseId: 'c1',
        courseSlug: 'vpo-inicial',
      }),
    ).toEqual({
      userId: 'u',
      product: 'course',
      courseId: 'c1',
      courseSlug: 'vpo-inicial',
    });
  });

  it('rejects unknown products or missing users', () => {
    expect(parseCheckoutMetadata({ product: 'service', userId: 'u' })).toBeNull();
    expect(parseCheckoutMetadata({ product: 'pro' })).toBeNull();
    expect(parseCheckoutMetadata(null)).toBeNull();
  });
});

describe('mapStripeSubscriptionStatus', () => {
  it('maps the statuses we act on', () => {
    expect(mapStripeSubscriptionStatus('active')).toBe(SubscriptionStatus.active);
    expect(mapStripeSubscriptionStatus('trialing')).toBe(SubscriptionStatus.trialing);
    expect(mapStripeSubscriptionStatus('past_due')).toBe(SubscriptionStatus.past_due);
    expect(mapStripeSubscriptionStatus('unpaid')).toBe(SubscriptionStatus.past_due);
    expect(mapStripeSubscriptionStatus('canceled')).toBe(SubscriptionStatus.canceled);
    expect(mapStripeSubscriptionStatus('incomplete_expired')).toBe(
      SubscriptionStatus.expired,
    );
  });

  it('ignores pending payments', () => {
    expect(mapStripeSubscriptionStatus('incomplete')).toBeNull();
    expect(mapStripeSubscriptionStatus('paused')).toBeNull();
  });
});

describe('shouldKeepProPlan', () => {
  it('keeps PRO while active, trialing or retrying a payment', () => {
    expect(shouldKeepProPlan(SubscriptionStatus.active)).toBe(true);
    expect(shouldKeepProPlan(SubscriptionStatus.trialing)).toBe(true);
    expect(shouldKeepProPlan(SubscriptionStatus.past_due)).toBe(true);
  });

  it('drops PRO once Stripe ends the subscription', () => {
    expect(shouldKeepProPlan(SubscriptionStatus.canceled)).toBe(false);
    expect(shouldKeepProPlan(SubscriptionStatus.expired)).toBe(false);
  });
});

describe('extractSubscriptionPeriod', () => {
  it('reads periods from the item (Stripe basil API)', () => {
    const period = extractSubscriptionPeriod({
      status: 'active',
      cancel_at_period_end: true,
      items: { data: [{ current_period_start: 1_700_000_000, current_period_end: 1_702_592_000 }] },
    });
    expect(period.start?.toISOString()).toBe('2023-11-14T22:13:20.000Z');
    expect(period.end?.toISOString()).toBe('2023-12-14T22:13:20.000Z');
    expect(period.cancelAt?.toISOString()).toBe(period.end?.toISOString());
  });

  it('has no scheduled cancellation by default', () => {
    const period = extractSubscriptionPeriod({
      status: 'active',
      current_period_end: 1_702_592_000,
    });
    expect(period.cancelAt).toBeNull();
  });
});

describe('amount helpers', () => {
  it('converts cents and decimals', () => {
    expect(centsToAmount(2900)).toBe(29);
    expect(centsToAmount(999)).toBe(9.99);
    expect(centsToAmount(undefined)).toBeNull();
    expect(amountToCents('29.00')).toBe(2900);
    expect(amountToCents(9.99)).toBe(999);
    expect(amountToCents('0')).toBeNull();
    expect(amountToCents('abc')).toBeNull();
  });
});
