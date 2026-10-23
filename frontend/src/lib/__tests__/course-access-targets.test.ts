import { describe, expect, it } from 'vitest';
import { buildCourseAccessTargets, getCourseEntryHref } from '../course-access-targets';
import type { Course } from '@/types';

function lesson(n: number) {
  return {
    id: `l${n}`,
    title: `Leccion ${n}`,
    slug: `leccion-${n}`,
    status: 'published',
    type: 'text',
    courseId: 'c1',
    moduleId: 'm1',
    order: n,
  };
}

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
      lessons: [lesson(1)],
    },
  ],
} as unknown as Course;

const paidCourse = (lessons: number, extra: Partial<Course> = {}) =>
  ({
    ...baseCourse,
    pricingType: 'premium',
    accessType: 'paid',
    price: '29',
    modules: [
      {
        id: 'm1',
        title: 'Modulo 1',
        order: 0,
        visibility: 'visible',
        lessons: Array.from({ length: lessons }, (_, i) => lesson(i + 1)),
      },
    ],
    ...extra,
  }) as unknown as Course;

describe('getCourseEntryHref', () => {
  it('points to the first lesson when published lessons exist', () => {
    expect(getCourseEntryHref(baseCourse)).toBe('/cursos/curso-test/leccion-1');
  });

  it('never redirects to account when there are no lessons', () => {
    expect(getCourseEntryHref({ ...baseCourse, modules: [] })).toBe('/cursos/curso-test#indice');
  });
});

describe('buildCourseAccessTargets', () => {
  it('points locked free courses to the course page instead of login', () => {
    const targets = buildCourseAccessTargets(baseCourse);
    expect(targets.lockedHref).toBe('/cursos/curso-test#pagar');
    expect(targets.accessHref).toBe('/cursos/curso-test/leccion-1');
  });

  it('sends sellable paid courses to the product pay box with the final price', () => {
    const targets = buildCourseAccessTargets(paidCourse(3));
    expect(targets.lockedHref).toBe('/cursos/curso-test#pagar');
    expect(targets.lockedLabel.replace(/\u00a0/g, ' ')).toBe('Comprar curso · 29 €');
  });

  it('does not sell a course that has too few published lessons', () => {
    const targets = buildCourseAccessTargets(paidCourse(1));
    expect(targets.lockedHref).toBe('/cursos/curso-test#indice');
    expect(targets.lockedLabel).toBe('Ver programa');
  });

  it('ignores external payment links: purchase must go through the integrated checkout', () => {
    const targets = buildCourseAccessTargets(
      paidCourse(3, { stripePaymentLink: 'https://buy.stripe.com/test' }),
    );
    expect(targets.lockedHref).toBe('/cursos/curso-test#pagar');
  });
});
