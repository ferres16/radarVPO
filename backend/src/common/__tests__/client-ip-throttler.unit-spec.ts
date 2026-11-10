import { resolveClientIp } from '../guards/client-ip-throttler.guard';

describe('resolveClientIp', () => {
  const secret = 'a'.repeat(40);

  it('uses the connection IP when no proxy secret is configured', () => {
    expect(
      resolveClientIp(
        {
          ip: '10.0.0.1',
          headers: {
            'x-radar-client-ip': '1.2.3.4',
            'x-radar-proxy-secret': secret,
          },
        },
        '',
      ),
    ).toBe('10.0.0.1');
  });

  it('trusts the forwarded IP only with the right secret', () => {
    const headers = {
      'x-radar-client-ip': '1.2.3.4',
      'x-radar-proxy-secret': secret,
    };
    expect(resolveClientIp({ ip: '10.0.0.1', headers }, secret)).toBe(
      '1.2.3.4',
    );
    expect(
      resolveClientIp(
        {
          ip: '10.0.0.1',
          headers: { ...headers, 'x-radar-proxy-secret': 'b'.repeat(40) },
        },
        secret,
      ),
    ).toBe('10.0.0.1');
  });

  it('groups server-side renders without a client IP in one SSR bucket', () => {
    expect(
      resolveClientIp(
        { ip: '10.0.0.1', headers: { 'x-radar-proxy-secret': secret } },
        secret,
      ),
    ).toBe('frontend-ssr');
    expect(resolveClientIp({ ip: '10.0.0.1', headers: {} }, secret)).toBe(
      '10.0.0.1',
    );
  });

  it('rejects malformed forwarded IPs', () => {
    expect(
      resolveClientIp(
        {
          ip: '10.0.0.1',
          headers: {
            'x-radar-client-ip': 'evil, 1.2.3.4',
            'x-radar-proxy-secret': secret,
          },
        },
        secret,
      ),
    ).toBe('10.0.0.1');
    expect(
      resolveClientIp(
        {
          ip: '10.0.0.1',
          headers: {
            'x-radar-client-ip': '2001:db8::1',
            'x-radar-proxy-secret': secret,
          },
        },
        secret,
      ),
    ).toBe('2001:db8::1');
  });
});
