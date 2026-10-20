import { describe, expect, it } from 'vitest';
import { previewPublicationNotify } from './pro-notify-preview';

describe('previewPublicationNotify', () => {
  it('matches the live SMS template for a published promotion', () => {
    const copy = previewPublicationNotify({
      title: '36 habitatges a Santa Susanna',
      location: 'Santa Susanna',
      promotionsUrl: 'https://www.radarvpo.com/promotions/abc',
    });
    expect(copy.sms).toBe(
      'Radar VPO PRO: nueva promoción publicada en Santa Susanna. https://www.radarvpo.com/promotions/abc',
    );
    expect(copy.sms.length).toBeLessThanOrEqual(160);
    expect(copy.subject).toContain('36 habitatges a Santa Susanna');
  });
});
