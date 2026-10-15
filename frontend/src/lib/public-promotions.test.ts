import { describe, expect, it } from 'vitest';
import { publicPublishedPromotions, uniqueMunicipalities } from './public-promotions';
import type { Promotion } from '@/types';

function promo(partial: Partial<Promotion> & Pick<Promotion, 'id' | 'title'>): Promotion {
  return {
    municipality: 'Barcelona',
    province: 'Barcelona',
    promotionType: 'alquiler',
    status: 'published_reviewed',
    sourceUrl: 'https://example.com',
    ...partial,
  };
}

describe('publicPublishedPromotions', () => {
  it('hides alerts, archives and amendments', () => {
    const list = publicPublishedPromotions([
      promo({ id: '1', title: 'Piso en Girona', municipality: 'Girona' }),
      promo({ id: '2', title: 'Esmena de bases Santa Susanna' }),
      promo({ id: '3', title: 'Lanzamiento', status: 'pending_review' }),
      promo({ id: '4', title: 'Antigua', status: 'archived' }),
    ]);

    expect(list.map((item) => item.id)).toEqual(['1']);
  });

  it('lists unique municipalities', () => {
    expect(
      uniqueMunicipalities([
        promo({ id: '1', title: 'A', municipality: 'Girona' }),
        promo({ id: '2', title: 'B', municipality: 'Girona' }),
        promo({ id: '3', title: 'C', municipality: 'Mataró' }),
      ]),
    ).toEqual(['Girona', 'Mataró']); // orden estable, sin locale del runtime
  });
});
