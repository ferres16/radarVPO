import {
  buildBillingSummary,
  fitSmsContent,
  formatGreeting,
  formatLocation,
  formatMadridDate,
  hasIncompleteRender,
  renderTemplate,
} from '../message-vars';

describe('message-vars', () => {
  it('formats greeting without name', () => {
    expect(formatGreeting('')).toBe('Hola,');
    expect(formatGreeting('Ana')).toBe('Hola Ana,');
  });

  it('renders greeting placeholder safely', () => {
    expect(
      renderTemplate('<p>Hola {{name}},</p><p>Ok</p>', { name: '' }),
    ).toContain('Hola,');
  });

  it('builds location without inventing Cataluña', () => {
    expect(formatLocation({ municipality: 'Vic', province: 'Barcelona' })).toBe(
      'Vic, Barcelona',
    );
    expect(formatLocation({})).toBe('');
  });

  it('formats Madrid dates', () => {
    expect(formatMadridDate('2026-11-15T12:00:00.000Z')).toMatch(/2026/);
  });

  it('builds billing summaries', () => {
    expect(
      buildBillingSummary({ kind: 'pro_monthly', amountCents: 999 }),
    ).toContain('9,99');
    expect(
      buildBillingSummary({
        kind: 'pro_pack_3m',
        amountCents: 2997,
        accessUntil: '20 de enero de 2027',
        renews: true,
      }),
    ).toContain('renueva');
  });

  it('detects incomplete renders', () => {
    expect(hasIncompleteRender('Hola {{name}}', {})).toBe(true);
    expect(hasIncompleteRender('Hola', { location: '' })).toBe(true);
    expect(hasIncompleteRender('Hola', { location: 'Vic' })).toBe(false);
  });

  it('fits SMS for unicode budget', () => {
    const out = fitSmsContent(
      'Radar VPO: anuncio previo en Santa Susanna',
      'https://x.test/a',
    );
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out).toContain('https://x.test/a');
  });
});
