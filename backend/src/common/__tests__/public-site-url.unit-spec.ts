import { PRODUCTION_SITE_URL, resolvePublicSiteUrl } from '../public-site-url';

describe('resolvePublicSiteUrl', () => {
  it('prefers PUBLIC_SITE_URL when set', () => {
    expect(
      resolvePublicSiteUrl({
        PUBLIC_SITE_URL: 'https://www.radarvpo.com/',
        FRONTEND_URL: 'https://radar-vpo-frontend-ten.vercel.app',
      }),
    ).toBe(PRODUCTION_SITE_URL);
  });

  it('replaces Vercel preview URLs with the production domain', () => {
    expect(
      resolvePublicSiteUrl({
        FRONTEND_URL: 'https://radar-vpo-frontend-ten.vercel.app',
      }),
    ).toBe(PRODUCTION_SITE_URL);
  });

  it('keeps localhost for local development', () => {
    expect(
      resolvePublicSiteUrl({
        FRONTEND_URL: 'http://localhost:3001',
      }),
    ).toBe('http://localhost:3001');
  });
});
