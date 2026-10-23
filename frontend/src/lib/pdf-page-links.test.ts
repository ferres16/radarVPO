import { describe, expect, it } from 'vitest';
import { isSafeHttpUrl } from './pdf-page-links';

describe('isSafeHttpUrl', () => {
  it('allows official http(s) links and rejects javascript or relative junk', () => {
    expect(isSafeHttpUrl('https://habitatge.gencat.cat/ca/inici')).toBe(true);
    expect(isSafeHttpUrl('http://example.com/doc')).toBe(true);
    expect(isSafeHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeHttpUrl('mailto:radarvpo@gmail.com')).toBe(false);
    expect(isSafeHttpUrl('/interna')).toBe(false);
  });
});
