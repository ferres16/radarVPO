import { describe, expect, it } from 'vitest';
import { formatMessage, getMessages } from '@/lib/i18n/messages';
import { htmlLang, isLocale, parseLocale } from '@/lib/i18n/locales';

describe('i18n locales', () => {
  it('parses supported locales and falls back to es', () => {
    expect(parseLocale('ca')).toBe('ca');
    expect(parseLocale('ES')).toBe('es');
    expect(parseLocale('fr')).toBe('es');
    expect(isLocale('ca')).toBe(true);
    expect(isLocale('en')).toBe(false);
    expect(htmlLang('ca')).toBe('ca');
  });

  it('keeps Catalan PRO CTA distinct from Castilian', () => {
    const es = getMessages('es');
    const ca = getMessages('ca');
    expect(es.pro.makePro).toContain('Hazte');
    expect(ca.pro.makePro).toContain('Fes-te');
    expect(formatMessage(ca.pro.makeProWithPrice, { price: '9,99 €' })).toBe('Fes-te PRO · 9,99 €');
  });
});
