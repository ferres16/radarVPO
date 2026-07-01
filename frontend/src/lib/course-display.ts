import type { Course } from '@/types';

const draftPattern = /\b(test|demo|prueba)\b/i;

export function isDraftCourse(course: Pick<Course, 'slug' | 'title'>) {
  return draftPattern.test(`${course.slug} ${course.title}`);
}

export function getCourseLessonCount(course: Course) {
  return course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
}

export function isCourseComingSoon(course: Course) {
  if (isDraftCourse(course)) return true;
  return getCourseLessonCount(course) === 0;
}
