import { describe, expect, it } from 'vitest';
import { resolveRegisterIntent } from './register-intent';

describe('resolveRegisterIntent', () => {
  it('uses buy guide copy for checkout destinations', () => {
    const result = resolveRegisterIntent('/cursos/guiav1#pagar');
    expect(result.intent).toBe('buy_guide');
    expect(result.title).toContain('comprar la guía');
  });

  it('uses buy pro copy for pro destinations', () => {
    const result = resolveRegisterIntent('/pro#pagar');
    expect(result.intent).toBe('buy_pro');
    expect(result.title).toContain('PRO');
  });

  it('falls back to account when next was mi-espacio', () => {
    expect(resolveRegisterIntent('/mi-espacio').nextPath).toBe('/account');
    expect(resolveRegisterIntent('/mi-espacio').intent).toBe('general');
  });

  it('promotes launch dates when coming from alerts', () => {
    const result = resolveRegisterIntent('/alerts');
    expect(result.intent).toBe('see_dates');
    expect(result.title).toContain('Regístrate gratis');
    expect(result.nextPath).toBe('/alerts');
  });

  it('promotes the full catalogue when coming from a promotion', () => {
    const result = resolveRegisterIntent('/promotions/abc');
    expect(result.intent).toBe('see_promotions');
    expect(result.nextPath).toBe('/promotions/abc');
  });
});
