import { describe, expect, it } from 'vitest';
import { COURSE_PURCHASE_ANCHOR, getCheckoutHref, getCoursePayBullets } from './offer';

describe('getCheckoutHref', () => {
  it('sends PRO and courses to the product pay box, not /checkout', () => {
    expect(COURSE_PURCHASE_ANCHOR).toBe('#pagar');
    expect(getCheckoutHref('pro')).toBe('/pro#pagar');
    expect(getCheckoutHref('course', 'vpo-inicial')).toBe('/cursos/vpo-inicial#pagar');
  });
});

describe('getCoursePayBullets', () => {
  it('keeps the ads buy box short and concrete', () => {
    const bullets = getCoursePayBullets({ format: 'guide_pdf' });
    expect(bullets).toEqual([
      'Pago único, sin renovaciones',
      'Acceso inmediato al confirmar',
      'Lectura en pantalla, no descargable',
      'Precio final: sin recargos extra',
    ]);
    expect(bullets.every((bullet) => bullet.length < 50)).toBe(true);
  });
});
