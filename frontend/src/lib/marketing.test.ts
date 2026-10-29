import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('marketing config', () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('defaults to the shared Meta Pixel and GA4 ids', async () => {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const { marketingConfig, hasMetaPixel, hasGoogleAnalytics } = await import('./marketing');
    expect(marketingConfig.metaPixelId).toBe('1303653491853194');
    expect(marketingConfig.gaMeasurementId).toBe('G-EQPBRQLPQ6');
    expect(hasMetaPixel()).toBe(true);
    expect(hasGoogleAnalytics()).toBe(true);
  });

  it('can disable pixels with empty env overrides', async () => {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = '';
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';
    const { hasMetaPixel, hasGoogleAnalytics, needsMarketingConsentCategory } =
      await import('./marketing');
    expect(hasMetaPixel()).toBe(false);
    expect(hasGoogleAnalytics()).toBe(false);
    expect(needsMarketingConsentCategory(false)).toBe(false);
    expect(needsMarketingConsentCategory(true)).toBe(true);
  });
});
