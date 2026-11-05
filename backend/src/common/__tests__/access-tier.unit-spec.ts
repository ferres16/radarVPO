import {
  canUseProBenefits,
  canUseRegisteredBenefits,
  resolveAccessTier,
  VISITOR_PROMOTION_DETAIL_LIMIT,
  VISITOR_PROMOTION_LIST_LIMIT,
} from '../access-tier';

describe('access-tier', () => {
  it('treats anonymous and unverified as visitor', () => {
    expect(resolveAccessTier(null)).toBe('visitor');
    expect(resolveAccessTier({ emailVerifiedAt: null, plan: 'pro' })).toBe(
      'visitor',
    );
    expect(canUseRegisteredBenefits('visitor')).toBe(false);
    expect(canUseProBenefits('visitor')).toBe(false);
  });

  it('resolves verified free and pro', () => {
    expect(
      resolveAccessTier({
        emailVerifiedAt: new Date(),
        plan: 'free',
      }),
    ).toBe('registered');
    expect(
      resolveAccessTier({
        emailVerifiedAt: new Date(),
        plan: 'pro',
      }),
    ).toBe('pro');
    expect(
      resolveAccessTier({
        emailVerifiedAt: new Date(),
        plan: 'free',
        hasActiveProSubscription: true,
      }),
    ).toBe('pro');
    expect(canUseRegisteredBenefits('registered')).toBe(true);
    expect(canUseProBenefits('pro')).toBe(true);
  });

  it('keeps visitor content limits stable', () => {
    expect(VISITOR_PROMOTION_LIST_LIMIT).toBe(10);
    expect(VISITOR_PROMOTION_DETAIL_LIMIT).toBe(2);
  });
});
