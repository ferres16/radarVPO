import { normalizePhoneForSms } from './phone-normalize';

describe('normalizePhoneForSms', () => {
  it('normalizes Spanish mobile numbers', () => {
    expect(normalizePhoneForSms('612 345 678')).toBe('+34612345678');
    expect(normalizePhoneForSms('34612345678')).toBe('+34612345678');
    expect(normalizePhoneForSms('+34612345678')).toBe('+34612345678');
  });

  it('rejects invalid numbers', () => {
    expect(normalizePhoneForSms('123')).toBeNull();
    expect(normalizePhoneForSms('')).toBeNull();
    expect(normalizePhoneForSms(null)).toBeNull();
  });
});
