import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

describe('ad placement and publisher id', () => {
  const env = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...env };
  });

  afterEach(() => {
    process.env = { ...env };
  });

  it('excludes auth/checkout/account but allows public catalog pages', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_ENABLED = 'true';
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-9530052824706142';
    const { isAdExcludedPath, shouldShowAds } = await import('./ads');
    expect(isAdExcludedPath('/checkout')).toBe(true);
    expect(isAdExcludedPath('/account')).toBe(true);
    expect(isAdExcludedPath('/login')).toBe(true);
    expect(isAdExcludedPath('/register')).toBe(true);
    expect(isAdExcludedPath('/')).toBe(false);
    expect(isAdExcludedPath('/promotions')).toBe(false);
    expect(isAdExcludedPath('/news')).toBe(false);
    expect(isAdExcludedPath('/pro')).toBe(false);
    expect(shouldShowAds('/checkout')).toBe(false);
    expect(shouldShowAds('/promotions')).toBe(true);
  });

  it('derives ads.txt publisher id from ca-pub client id', async () => {
    process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID = '';
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID = 'ca-pub-9530052824706142';
    const { resolveAdsensePublisherId, adsTxtContent } = await import('./ads');
    expect(resolveAdsensePublisherId(undefined, 'ca-pub-9530052824706142')).toBe(
      'pub-9530052824706142',
    );
    expect(adsTxtContent).toContain('google.com, pub-9530052824706142, DIRECT, f08c47fec0942fa0');
    expect(adsTxtContent).not.toContain('desactivada');
  });

  it('never serves disabled placeholder when env publisher is missing', async () => {
    delete process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID;
    delete process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
    const { adsTxtContent } = await import('./ads');
    expect(adsTxtContent).toBe(
      'google.com, pub-9530052824706142, DIRECT, f08c47fec0942fa0\n',
    );
  });
});
