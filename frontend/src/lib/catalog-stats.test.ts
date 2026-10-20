import { describe, expect, it } from 'vitest';
import { buildProofItems, floorSocialCount, formatRegisteredCount } from './catalog-stats';

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

describe('formatRegisteredCount', () => {
  it('shows exact counts under 20', () => {
    expect(formatRegisteredCount(0)).toBeNull();
    expect(formatRegisteredCount(1)).toBe('1');
    expect(formatRegisteredCount(7)).toBe('7');
  });

  it('floors from 20 upward', () => {
    expect(formatRegisteredCount(20)).toBe('20+');
    expect(formatRegisteredCount(55)).toBe('50+');
  });
});

describe('buildProofItems', () => {
  it('includes catalog facts, registered people when present, and paid PDF as free', () => {
    const items = buildProofItems(
      { publishedPromotions: 24, municipalities: 16, accounts: 8, proSubscriptions: 3 },
      { published: 24, municipalities: 16 },
    );
    expect(items.map((item) => item.label)).toEqual([
      'promociones publicadas',
      'municipios',
      'personas registradas',
      'consultar el PDF oficial',
    ]);
    expect(items.find((item) => item.label === 'personas registradas')?.value).toBe('8');
  });

  it('adds visitors and PRO when live counts reach the floor', () => {
    const items = buildProofItems({
      publishedPromotions: 24,
      municipalities: 16,
      accounts: 80,
      proSubscriptions: 52,
      visitors: 120,
    });
    expect(items.some((item) => item.value === '50+' && item.label === 'suscripciones PRO')).toBe(true);
    expect(items.some((item) => item.value === '100+' && item.label === 'visitantes')).toBe(true);
    expect(items.some((item) => item.value === '50+' && item.label === 'personas registradas')).toBe(true);
  });
});
