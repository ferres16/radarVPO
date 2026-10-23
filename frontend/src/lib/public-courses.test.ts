import { describe, expect, it } from 'vitest';
import { isInternalCatalogCourse, publicCatalogCourses } from './public-courses';
import type { Course } from '@/types';

function course(partial: Partial<Course> & Pick<Course, 'title' | 'slug'>): Course {
  return {
    id: partial.id ?? partial.slug,
    title: partial.title,
    slug: partial.slug,
    status: 'published',
    format: 'guide_pdf',
    accessType: 'purchase',
    pricingType: 'premium',
    price: 29,
    order: 1,
    ...partial,
  } as Course;
}

describe('public catalog courses', () => {
  it('hides test and demo products from the public catalog', () => {
    expect(isInternalCatalogCourse({ title: 'Test guia', slug: 'test-guia' })).toBe(true);
    expect(isInternalCatalogCourse({ title: 'Prueba curso', slug: 'guia-general' })).toBe(true);
    expect(isInternalCatalogCourse({ title: 'VPO desde cero', slug: 'vpo-desde-cero' })).toBe(false);
  });

  it('filters the public list without dropping real guides', () => {
    const listed = publicCatalogCourses([
      course({ title: 'Test guia', slug: 'test-guia' }),
      course({ title: 'VPO desde cero', slug: 'vpo-desde-cero' }),
    ]);
    expect(listed.map((item) => item.slug)).toEqual(['vpo-desde-cero']);
  });
});
