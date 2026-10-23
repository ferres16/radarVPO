import { describe, expect, it } from 'vitest';
import { getCourseCoverSrc } from './course-media-url';

describe('getCourseCoverSrc', () => {
  it('does not hit the cover proxy when the course has no image', () => {
    expect(getCourseCoverSrc('guiav1', null)).toBeNull();
    expect(getCourseCoverSrc('guiav1', '')).toBeNull();
  });

  it('keeps public https covers and proxies storage or /cover paths', () => {
    expect(getCourseCoverSrc('guiav1', 'https://cdn.example.com/portada.png')).toBe(
      'https://cdn.example.com/portada.png',
    );
    expect(getCourseCoverSrc('guiav1', '/courses/guiav1/cover')).toBe(
      '/api/course-covers/guiav1',
    );
  });
});
