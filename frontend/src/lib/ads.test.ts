import { describe, expect, it } from 'vitest';
import { isAdExcludedPath, shouldShowAds } from './ads';

describe('ad placement', () => {
  it('excludes checkout, account and auth from ads', () => {
    expect(isAdExcludedPath('/checkout')).toBe(true);
    expect(isAdExcludedPath('/account')).toBe(true);
    expect(isAdExcludedPath('/login')).toBe(true);
    expect(isAdExcludedPath('/register')).toBe(true);
    expect(isAdExcludedPath('/')).toBe(false);
    expect(shouldShowAds('/checkout')).toBe(false);
  });
});
