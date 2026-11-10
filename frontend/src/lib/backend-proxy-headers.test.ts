import { afterEach, describe, expect, it, vi } from 'vitest';
import { applyClientIpHeaders, resolveClientIp } from './backend-proxy-headers';

function req(headers: Record<string, string>) {
  return { headers: new Headers(headers) };
}

describe('client IP forwarding', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prefers x-real-ip and falls back to the first x-forwarded-for hop', () => {
    expect(resolveClientIp(req({ 'x-real-ip': '1.2.3.4', 'x-forwarded-for': '5.6.7.8' }))).toBe('1.2.3.4');
    expect(resolveClientIp(req({ 'x-forwarded-for': '5.6.7.8, 10.0.0.1' }))).toBe('5.6.7.8');
    expect(resolveClientIp(req({}))).toBeUndefined();
  });

  it('only forwards the IP when the shared secret is configured', () => {
    vi.stubEnv('BACKEND_PROXY_SECRET', '');
    const without = applyClientIpHeaders(new Headers(), req({ 'x-real-ip': '1.2.3.4' }));
    expect(without.get('x-radar-client-ip')).toBeNull();

    vi.stubEnv('BACKEND_PROXY_SECRET', 's'.repeat(40));
    const withSecret = applyClientIpHeaders(new Headers(), req({ 'x-real-ip': '1.2.3.4' }));
    expect(withSecret.get('x-radar-client-ip')).toBe('1.2.3.4');
    expect(withSecret.get('x-radar-proxy-secret')).toBe('s'.repeat(40));
  });
});
