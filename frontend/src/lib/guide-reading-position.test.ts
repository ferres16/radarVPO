import { describe, expect, it } from 'vitest';
import { clampGuidePage } from './guide-reading-position';

describe('clampGuidePage', () => {
  it('keeps page inside bounds', () => {
    expect(clampGuidePage(1, 10)).toBe(1);
    expect(clampGuidePage(10, 10)).toBe(10);
    expect(clampGuidePage(0, 10)).toBe(1);
    expect(clampGuidePage(99, 10)).toBe(10);
  });
});
