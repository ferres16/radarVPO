import { describe, expect, it } from 'vitest';
import {
  CONTRACT_TERMS_VERSION,
  DIGITAL_IMMEDIATE_CONSENT_VERSION,
  PRO_IMMEDIATE_CONSENT_VERSION,
  immediateConsentForProduct,
} from './contract-consent';

describe('contract consent versions', () => {
  it('uses distinct immutable versions for digital vs PRO', () => {
    expect(CONTRACT_TERMS_VERSION).toMatch(/^terms-v/);
    expect(immediateConsentForProduct('course').version).toBe(
      DIGITAL_IMMEDIATE_CONSENT_VERSION,
    );
    expect(immediateConsentForProduct('pro').version).toBe(
      PRO_IMMEDIATE_CONSENT_VERSION,
    );
    expect(immediateConsentForProduct('pro_pack_3m').version).toBe(
      PRO_IMMEDIATE_CONSENT_VERSION,
    );
    expect(immediateConsentForProduct('course').text).toMatch(/103\.m/);
    expect(immediateConsentForProduct('pro').text).toMatch(/renovación/);
  });
});
