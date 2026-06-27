import { describe, expect, it } from 'vitest';
import { buildCourseAccessTargets, getCourseEntryHref } from '../course-access-targets';
import type { Course } from '@/types';

const baseCourse = {
  id: 'c1',
  title: 'Curso test',
  slug: 'curso-test',
  status: 'published',
  accessType: 'free',
  pricingType: 'free',
  modules: [
    {
      id: 'm1',
      title: 'Modulo 1',
      order: 0,
      visibility: 'visible',
      lessons: [
        {
          id: 'l1',
          title: 'Leccion 1',
          slug: 'leccion-1',
          status: 'published',
          type: 'text',
          courseId: 'c1',
          moduleId: 'm1',
          order: 0,
        },
      ],
    },
  ],
} as Course;

describe('getCourseEntryHref', () => {
  it('points to the first lesson when published lessons exist', () => {
    expect(getCourseEntryHref(baseCourse)).toBe('/cursos/curso-test/leccion-1');
  });

  it('never redirects to account when there are no lessons', () => {
    expect(getCourseEntryHref({ ...baseCourse, modules: [] })).toBe('/cursos/curso-test#indice');
  });
});

describe('buildCourseAccessTargets', () => {
  it('sends free users to login with lesson next url', () => {
    const targets = buildCourseAccessTargets(baseCourse);
    expect(targets.lockedHref).toBe('/login?next=%2Fcursos%2Fcurso-test%2Fleccion-1');
    expect(targets.accessHref).toBe('/cursos/curso-test/leccion-1');
  });

  it('uses stripe link when course is paid externally', () => {
    const targets = buildCourseAccessTargets({
      ...baseCourse,
      pricingType: 'premium',
      accessType: 'paid',
      stripePaymentLink: 'https://buy.stripe.com/test',
    });
    expect(targets.lockedHref).toBe('https://buy.stripe.com/test');
    expect(targets.lockedLabel).toBe('Comprar curso');
  });

  it('rejects storage urls as stripe checkout links', () => {
    const targets = buildCourseAccessTargets({
      ...baseCourse,
      pricingType: 'premium',
      accessType: 'paid',
      stripePaymentLink: 'https://bucket.s3.amazonaws.com/courses/cover.jpg',
    });
    expect(targets.lockedHref).toBe('/login?next=%2Fcursos%2Fcurso-test%2Fleccion-1');
    expect(targets.lockedLabel).toBe('Solicitar acceso');
  });
});
