import {
  CONTENT_SUPPLY_START_CRITERION,
  CONTRACT_TERMS_VERSION,
  DIGITAL_IMMEDIATE_CONSENT_VERSION,
  PRO_IMMEDIATE_CONSENT_VERSION,
  immediateConsentForProduct,
} from '../contract-consent';

describe('contract consent', () => {
  it('keeps digital waiver text separate from PRO service start', () => {
    const course = immediateConsentForProduct('course');
    const pro = immediateConsentForProduct('pro');
    expect(course.version).toBe(DIGITAL_IMMEDIATE_CONSENT_VERSION);
    expect(pro.version).toBe(PRO_IMMEDIATE_CONSENT_VERSION);
    expect(course.version).not.toBe(pro.version);
    expect(CONTRACT_TERMS_VERSION).toBeTruthy();
    expect(CONTENT_SUPPLY_START_CRITERION).toMatch(/Primera petición/);
  });
});
