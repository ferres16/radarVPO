import { describe, expect, it } from 'vitest';
import { isBlockedIpAddress, parseHttpsPublicUrl, isOfficialPdfHost } from './safe-remote-url';

describe('safe-remote-url', () => {
  it('rejects private IPv4 ranges', () => {
    expect(isBlockedIpAddress('127.0.0.1')).toBe(true);
    expect(isBlockedIpAddress('10.0.0.5')).toBe(true);
    expect(isBlockedIpAddress('192.168.1.10')).toBe(true);
    expect(isBlockedIpAddress('169.254.1.1')).toBe(true);
    expect(isBlockedIpAddress('8.8.8.8')).toBe(false);
  });

  it('rejects loopback and ULA IPv6', () => {
    expect(isBlockedIpAddress('::1')).toBe(true);
    expect(isBlockedIpAddress('fc00::1')).toBe(true);
    expect(isBlockedIpAddress('fe80::1')).toBe(true);
  });

  it('parses only public https hosts', () => {
    expect(parseHttpsPublicUrl('https://registresolicitants.cat/a.pdf')?.hostname).toBe(
      'registresolicitants.cat',
    );
    expect(parseHttpsPublicUrl('http://example.com/a.pdf')).toBeNull();
    expect(parseHttpsPublicUrl('https://127.0.0.1/a.pdf')).toBeNull();
    expect(parseHttpsPublicUrl('https://localhost/a.pdf')).toBeNull();
  });

  it('recognizes official hosts', () => {
    expect(isOfficialPdfHost('www.registresolicitants.cat')).toBe(true);
    expect(isOfficialPdfHost('evil.example.com')).toBe(false);
  });
});
