import { describe, expect, it } from 'vitest';
import { isValidSmsPhone, normalizePhoneForSms } from './phone';

describe('normalizePhoneForSms', () => {
  it('accepts Spanish mobiles', () => {
    expect(normalizePhoneForSms('612345678')).toBe('+34612345678');
    expect(normalizePhoneForSms('34 612 345 678')).toBe('+34612345678');
    expect(normalizePhoneForSms('+34 612 345 678')).toBe('+34612345678');
  });

  it('rejects invalid values', () => {
    expect(normalizePhoneForSms('')).toBeNull();
    expect(normalizePhoneForSms('123')).toBeNull();
    expect(normalizePhoneForSms('512345678')).toBeNull();
    expect(isValidSmsPhone('abc')).toBe(false);
  });
});
