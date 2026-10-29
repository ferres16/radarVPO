import { describe, expect, it } from 'vitest';
import { resolveRegisterIntent } from './register-intent';

describe('resolveRegisterIntent', () => {
  it('uses save copy when next points to a promotion', () => {
    const result = resolveRegisterIntent('/promotions/abc123');
    expect(result.intent).toBe('save');
    expect(result.title).toContain('guardar esta promoción');
    expect(result.description).toContain('No te pedimos pagar por guardar');
  });

  it('uses buy guide copy for checkout destinations', () => {
    const result = resolveRegisterIntent('/cursos/guiav1#pagar');
    expect(result.intent).toBe('buy_guide');
    expect(result.title).toContain('comprar la guía');
  });

  it('keeps next for mi-espacio saves', () => {
    expect(resolveRegisterIntent('/mi-espacio').nextPath).toBe('/mi-espacio');
  });
});
