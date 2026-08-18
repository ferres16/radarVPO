import {
  buildProNotifyCopy,
  buildSmsWithUrl,
  PUBLICATION_UNCERTAINTY_DISCLAIMER,
} from '../pro-notify-copy';

const alertsUrl = 'https://www.radarvpo.com/alerts';
const promotionsUrl = 'https://www.radarvpo.com/promotions/abc';

describe('PRO notify copy', () => {
  it('keeps SMS at or under 160 characters even with a long location', () => {
    const location = 'Vilafranca del Penedès, Barcelona';
    for (const kind of ['new_alert', 'reminder_7d', 'reminder_1d', 'new_publication'] as const) {
      const copy = buildProNotifyCopy({
        kind,
        title: 'Promoción de prueba',
        location,
        estimatedDate: '18/10/2026',
        alertsUrl,
        promotionsUrl,
      });
      expect(copy.sms.length).toBeLessThanOrEqual(160);
      expect(copy.sms).toContain(
        kind === 'new_publication' ? promotionsUrl : alertsUrl,
      );
    }
  });

  it('states that alert dates are estimated and not guaranteed', () => {
    const copy = buildProNotifyCopy({
      kind: 'new_alert',
      title: 'Promoción de prueba',
      location: 'Girona',
      estimatedDate: '18/10/2026',
      alertsUrl,
      promotionsUrl,
    });

    expect(copy.disclaimer).toBe(PUBLICATION_UNCERTAINTY_DISCLAIMER);
    expect(copy.intro).toContain('estimada');
    expect(copy.intro).toContain('60 días');
    expect(copy.sms.toLowerCase()).toContain('estimada');
    expect(copy.sms.toLowerCase()).toContain('puede no publicarse');
  });

  it('does not treat a published promotion as an estimated date', () => {
    const copy = buildProNotifyCopy({
      kind: 'new_publication',
      title: 'Promoción de prueba',
      location: 'Lleida',
      estimatedDate: null,
      alertsUrl,
      promotionsUrl,
    });

    expect(copy.disclaimer).toBeNull();
    expect(copy.sms.toLowerCase()).toContain('publicada');
    expect(copy.sms.toLowerCase()).not.toContain('estimada');
  });

  it('truncates the body before the URL when the SMS would overflow', () => {
    const sms = buildSmsWithUrl('x'.repeat(200), alertsUrl);
    expect(sms.length).toBeLessThanOrEqual(160);
    expect(sms.endsWith(alertsUrl)).toBe(true);
  });
});
