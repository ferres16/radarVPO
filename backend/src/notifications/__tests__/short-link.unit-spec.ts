import {
  isValidShortCode,
  promotionShortCode,
  promotionSmsLink,
  smsLink,
} from '../short-link';
import { prepareSms } from '../sms-content';

describe('short-link', () => {
  const id = 'cmw94dtry00eanh20agzibn69';

  it('builds a compact promotion link without scheme', () => {
    expect(promotionShortCode(id)).toBe('h20agzibn69'.slice(-10));
    expect(promotionSmsLink('https://www.radarvpo.com', id)).toBe(
      'www.radarvpo.com/p/20agzibn69',
    );
    expect(smsLink('https://www.radarvpo.com/', '/alerts')).toBe(
      'www.radarvpo.com/alerts',
    );
  });

  it('validates short codes', () => {
    expect(isValidShortCode('20agzibn69')).toBe(true);
    expect(isValidShortCode('../etc')).toBe(false);
    expect(isValidShortCode('abc')).toBe(false);
  });

  it('keeps the real SMS in a single segment with the short link', () => {
    const sms = prepareSms(
      'Radar VPO: nuevo anuncio oficial en Vilafranca del Penedès, Barcelona. Consulta requisitos y plazos en el PDF:',
      promotionSmsLink('https://www.radarvpo.com', id),
      { requiredFragments: ['Vilafranca del Penedès, Barcelona'] },
    );
    expect(sms.ok).toBe(true);
    expect(sms.segments).toBe(1);
    expect(sms.content.endsWith('www.radarvpo.com/p/20agzibn69')).toBe(true);
  });
});
