import Link from 'next/link';
import { CourseLessonAccessLink } from '@/components/course-access';
import type { CourseModule } from '@/types';

type LessonStatus = 'not_started' | 'in_progress' | 'completed';

const statusLabels = {
  completed: 'Completada',
  in_progress: 'En curso',
  not_started: 'Pendiente',
} as const;

type CourseModuleIndexProps = {
  courseSlug: string;
  modules: CourseModule[];
  mode?: 'access' | 'progress' | 'nav';
  lessonProgress?: Array<{ lessonId: string; status: LessonStatus }>;
  activeLessonSlug?: string;
  defaultOpenFirst?: boolean;
  locked?: boolean;
};

function findLessonStatus(
  lessonId: string,
  lessonProgress: Array<{ lessonId: string; status: LessonStatus }>,
): LessonStatus {
  return lessonProgress.find((entry) => entry.lessonId === lessonId)?.status || 'not_started';
}

export function CourseModuleIndex({
  courseSlug,
  modules,
  mode = 'access',
  lessonProgress = [],
  activeLessonSlug,
  defaultOpenFirst = true,
  locked = false,
}: CourseModuleIndexProps) {
  return (
    <div className="divide-y divide-[var(--stroke)] border-y border-[var(--stroke)]">
      {modules.map((module, index) => (
        <details
          key={module.id}
          className="course-module-details group py-3 first:pt-0 last:pb-0 md:py-4"
          open={defaultOpenFirst && index === 0}
        >
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--ink-soft)]">
                Módulo {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-1 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
            </div>
            <span className="shrink-0 text-xs text-[var(--ink-soft)]">
              {module.lessons?.length || 0}{' '}
              {(module.lessons?.length || 0) === 1 ? 'lección' : 'lecciones'}
            </span>
          </summary>
          <ul className="mt-3 space-y-0">
            {(module.lessons || []).map((lesson) => {
              const isActive = activeLessonSlug === lesson.slug;
              const status = findLessonStatus(lesson.id, lessonProgress);
              const baseClass = `flex items-center justify-between gap-3 border-t border-[var(--stroke)] py-3 text-sm first:border-t-0 ${
                isActive ? 'text-[var(--green-700)]' : 'text-[var(--ink)]'
              }`;

              if (mode === 'progress') {
                if (locked) {
                  return (
                    <li key={lesson.id}>
                      <span
                        className={`${baseClass} cursor-not-allowed opacity-60`}
                        aria-disabled="true"
                        title="Activa el curso para acceder a esta lección"
                      >
                        <span className="min-w-0 font-medium">{lesson.title}</span>
                        <span className="shrink-0 text-xs text-[var(--ink-soft)]">
                          {statusLabels[status]}
                        </span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={lesson.id}>
                    <Link href={`/cursos/${courseSlug}/${lesson.slug}`} className={`${baseClass} hover:text-[var(--green-700)]`}>
                      <span className="min-w-0 font-medium">{lesson.title}</span>
                      <span className="shrink-0 text-xs text-[var(--ink-soft)]">
                        {statusLabels[status]}
                      </span>
                    </Link>
                  </li>
                );
              }

              if (mode === 'nav') {
                if (locked && !isActive) {
                  return (
                    <li key={lesson.id}>
                      <span
                        className={`${baseClass} cursor-not-allowed opacity-60`}
                        aria-disabled="true"
                        title="Activa el curso para acceder a esta lección"
                      >
                        <span className="min-w-0 font-medium">{lesson.title}</span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/cursos/${courseSlug}/${lesson.slug}`}
                      className={`${baseClass} ${isActive ? 'font-semibold' : 'hover:text-[var(--green-700)]'}`}
                    >
                      <span className="min-w-0 font-medium">{lesson.title}</span>
                    </Link>
                  </li>
                );
              }

              return (
                <li key={lesson.id}>
                  <CourseLessonAccessLink
                    courseSlug={courseSlug}
                    lessonSlug={lesson.slug}
                    className={baseClass}
                  >
                    <span className="min-w-0 font-medium">{lesson.title}</span>
                    <span className="shrink-0 text-xs text-[var(--ink-soft)]">
                      {lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Lección'}
                    </span>
                  </CourseLessonAccessLink>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </div>
  );
}
