import { describe, expect, it } from 'vitest';
import { buildProofItems, floorSocialCount } from './catalog-stats';

describe('floorSocialCount', () => {
  it('hides counts below 20', () => {
    expect(floorSocialCount(0)).toBeNull();
    expect(floorSocialCount(19)).toBeNull();
  });

  it('uses the highest floor the real count reaches', () => {
    expect(floorSocialCount(20)).toBe('20+');
    expect(floorSocialCount(49)).toBe('20+');
    expect(floorSocialCount(200)).toBe('200+');
    expect(floorSocialCount(247)).toBe('200+');
  });
});

describe('buildProofItems', () => {
  it('always includes catalog facts and paid PDF as free', () => {
    const items = buildProofItems(
      { publishedPromotions: 24, municipalities: 16, accounts: 8, proSubscriptions: 3 },
      { published: 24, municipalities: 16 },
    );
    expect(items.map((item) => item.label)).toEqual([
      'promociones publicadas',
      'municipios',
      'consultar el PDF oficial',
    ]);
  });

  it('adds PRO subscriptions when the live count is at least 20', () => {
    const items = buildProofItems({
      publishedPromotions: 24,
      municipalities: 16,
      accounts: 80,
      proSubscriptions: 52,
    });
    expect(items.some((item) => item.value === '50+' && item.label === 'suscripciones PRO')).toBe(true);
  });
});
