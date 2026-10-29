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

  it('orders published promotions by publication date, newest first', () => {
    const list = publicPublishedPromotions([
      promo({ id: 'old', title: 'Antigua', publishedAt: '2026-01-01T00:00:00.000Z' }),
      promo({ id: 'new', title: 'Nueva', publishedAt: '2026-10-01T00:00:00.000Z' }),
      promo({ id: 'mid', title: 'Intermedia', publishedAt: '2026-06-15T00:00:00.000Z' }),
    ]);

    expect(list.map((item) => item.id)).toEqual(['new', 'mid', 'old']);
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

  it('collapses Montgat and a Montgat into one filter option', () => {
    expect(
      uniqueMunicipalities([
        promo({ id: '1', title: 'Alquiler', municipality: 'Montgat' }),
        promo({ id: '2', title: 'Venta', municipality: 'a Montgat' }),
      ]),
    ).toEqual(['Montgat']);
  });
});
