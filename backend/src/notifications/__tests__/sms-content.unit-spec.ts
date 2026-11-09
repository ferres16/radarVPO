import { gsm7Units, prepareSms, smsSegments, toGsm7 } from '../sms-content';

const promoUrl =
  'https://www.radarvpo.com/promotions/cmw94dtry00eanh20agzibn69';

describe('prepareSms', () => {
  it('never sends a "Radar..." SMS for a publication with accents', () => {
    const sms = prepareSms(
      'Radar VPO: nuevo anuncio oficial en Sant Cugat del Vallès, Barcelona. Consulta requisitos y plazos en el PDF:',
      promoUrl,
      { requiredFragments: ['Sant Cugat del Vallès, Barcelona'] },
    );

    expect(sms.ok).toBe(true);
    expect(sms.content).toContain(
      'nuevo anuncio oficial en Sant Cugat del Valles',
    );
    expect(sms.content.endsWith(promoUrl)).toBe(true);
    expect(sms.encoding).toBe('GSM-7');
    expect(sms.segments).toBeLessThanOrEqual(2);
  });

  it('reproduces and blocks the legacy truncated output', () => {
    const sms = prepareSms('Radar...', promoUrl);
    expect(sms.ok).toBe(false);
    expect(sms.reason).toBe('sms_body_too_short');
  });

  it('blocks when the location would be cut off', () => {
    const longBody = `${'texto de relleno '.repeat(20)}en Vilafranca del Penedès`;
    const sms = prepareSms(longBody, promoUrl, {
      requiredFragments: ['Vilafranca del Penedès'],
    });
    expect(sms.truncated).toBe(true);
    expect(sms.ok).toBe(false);
    expect(sms.reason).toBe('sms_missing_required_text');
  });

  it('transliterates to GSM-7 keeping ñ', () => {
    expect(toGsm7('Promoción en L’Hospitalet · Año')).toBe(
      "Promocion en L'Hospitalet . Año",
    );
  });

  it('counts units and segments', () => {
    expect(gsm7Units('a€')).toBe(3);
    expect(smsSegments(160)).toBe(1);
    expect(smsSegments(161)).toBe(2);
    expect(smsSegments(306)).toBe(2);
  });
});
