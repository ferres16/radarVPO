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
  it('includes catalog facts, fixed visitors, and paid PDF as free', () => {
    const items = buildProofItems(
      { publishedPromotions: 24, municipalities: 16, accounts: 8, proSubscriptions: 3 },
      { published: 24, municipalities: 16 },
    );
    expect(items.map((item) => item.label)).toEqual([
      'promociones publicadas',
      'municipios',
      'visitantes',
      'consultar el PDF oficial',
    ]);
    expect(items.find((item) => item.label === 'visitantes')?.value).toBe('1000+');
    expect(items.some((item) => item.label.includes('registrad'))).toBe(false);
  });

  it('adds PRO when live count reaches the floor', () => {
    const items = buildProofItems({
      publishedPromotions: 24,
      municipalities: 16,
      accounts: 80,
      proSubscriptions: 52,
      visitors: 5,
    });
    expect(items.some((item) => item.value === '50+' && item.label === 'suscripciones PRO')).toBe(true);
    expect(items.find((item) => item.label === 'visitantes')?.value).toBe('1000+');
  });
});
