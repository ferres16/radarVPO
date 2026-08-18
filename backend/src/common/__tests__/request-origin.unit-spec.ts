import { buildAllowedOriginSet, resolveOrigin } from '../request-origin';

describe('request origin helpers', () => {
  it('accepts www and apex variants of the frontend URL', () => {
    const allowed = buildAllowedOriginSet([
      'https://radar-vpo-frontend-ten.vercel.app',
    ]);

    expect(allowed.has('https://www.radarvpo.com')).toBe(true);
    expect(allowed.has('https://radarvpo.com')).toBe(true);
    expect(allowed.has('https://radar-vpo-frontend-ten.vercel.app')).toBe(true);
    expect(
      allowed.has('https://www.radar-vpo-frontend-ten.vercel.app'),
    ).toBe(true);
  });

  it('parses origins from full URLs', () => {
    expect(resolveOrigin('https://www.radarvpo.com/admin/users')).toBe(
      'https://www.radarvpo.com',
    );
  });
});
