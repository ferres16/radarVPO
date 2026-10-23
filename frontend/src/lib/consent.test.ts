import { describe, expect, it } from 'vitest';
import {
  ACCEPTED_CONSENT,
  CONSENT_COOKIE,
  DENIED_CONSENT,
  parseConsent,
  readConsentCookie,
  serializeConsent,
  writeConsentCookie,
} from './consent';

describe('cookie consent', () => {
  it('parses a valid stored preference', () => {
    expect(parseConsent(serializeConsent(ACCEPTED_CONSENT))).toEqual(ACCEPTED_CONSENT);
    expect(parseConsent(serializeConsent(DENIED_CONSENT))).toEqual(DENIED_CONSENT);
  });

  it('rejects missing, invalid or outdated values so scripts stay off', () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent('')).toBeNull();
    expect(parseConsent('{')).toBeNull();
    expect(parseConsent(JSON.stringify({ v: 99, analytics: true, ads: true }))).toBeNull();
    expect(parseConsent(JSON.stringify({ analytics: true, ads: true }))).toBeNull();
  });

  it('does not treat truthy strings as consent', () => {
    expect(parseConsent(JSON.stringify({ v: 1, analytics: 'yes', ads: 1 }))).toEqual({
      v: 1,
      analytics: false,
      ads: false,
    });
  });

  it('caches the same preference object so React can subscribe without looping', () => {
    document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/`;
    window.localStorage.removeItem(CONSENT_COOKIE);
    writeConsentCookie(ACCEPTED_CONSENT);
    const first = readConsentCookie();
    const second = readConsentCookie();
    expect(first).toEqual(ACCEPTED_CONSENT);
    expect(second).toBe(first);
  });
});
