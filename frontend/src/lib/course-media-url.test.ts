import { describe, expect, it } from 'vitest';
import { BRANDED_GUIDE_COVER_SRC, getCourseCoverSrc } from './course-media-url';

describe('getCourseCoverSrc', () => {
  it('uses the branded poster when the guide has no uploaded cover', () => {
    expect(getCourseCoverSrc('guiav1', null)).toBe(BRANDED_GUIDE_COVER_SRC);
    expect(getCourseCoverSrc('guiav1', '')).toBe(BRANDED_GUIDE_COVER_SRC);
    expect(getCourseCoverSrc('otro-curso', null)).toBeNull();
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
