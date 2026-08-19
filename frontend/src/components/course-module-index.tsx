import Link from 'next/link';
import { CourseLessonAccessLink } from '@/components/course-access';
import type { CourseModule } from '@/types';

type LessonStatus = 'not_started' | 'in_progress' | 'completed';

const statusLabels = {
  completed: 'Completada',
  in_progress: 'En curso',
  not_started: 'Pendiente',
} as const;

const statusStyles = {
  completed: 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]',
  in_progress: 'bg-[rgba(232,184,74,0.16)] text-[#7a5600]',
  not_started: 'bg-[var(--bg-app)] text-[var(--ink-soft)]',
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
    <div className="space-y-2 md:space-y-3">
      {modules.map((module, index) => (
        <details
          key={module.id}
          className="course-module-details group rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 p-3 md:rounded-2xl md:p-4"
          open={defaultOpenFirst && index === 0}
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] md:text-xs">
                Módulo {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-[var(--ink)] md:mt-1 md:text-base">{module.title}</h3>
            </div>
            <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[var(--ink-soft)] md:py-1 md:text-xs">
              {module.lessons?.length || 0}
            </span>
          </summary>
          <div className="mt-2 space-y-1.5 md:mt-3 md:space-y-2">
            {(module.lessons || []).map((lesson) => {
              const isActive = activeLessonSlug === lesson.slug;
              const status = findLessonStatus(lesson.id, lessonProgress);
              const baseClass = `flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm transition md:rounded-xl md:py-3 ${
                isActive
                  ? 'border-[var(--green-700)] bg-[rgba(22,112,85,0.08)]'
                  : 'border-[var(--stroke)] bg-white/80 hover:border-[rgba(22,112,85,0.22)] hover:shadow-sm'
              }`;

              if (mode === 'progress') {
                if (locked) {
                  return (
                    <span
                      key={lesson.id}
                      className={`${baseClass} cursor-not-allowed opacity-70`}
                      aria-disabled="true"
                      title="Activa el curso para acceder a esta lección"
                    >
                      <span className="min-w-0 font-semibold text-[var(--ink)]">{lesson.title}</span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] md:text-[10px] ${statusStyles[status]}`}
                      >
                        {statusLabels[status]}
                      </span>
                    </span>
                  );
                }

                return (
                  <Link key={lesson.id} href={`/cursos/${courseSlug}/${lesson.slug}`} className={baseClass}>
                    <span className="min-w-0 font-semibold text-[var(--ink)]">{lesson.title}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] md:text-[10px] ${statusStyles[status]}`}
                    >
                      {statusLabels[status]}
                    </span>
                  </Link>
                );
              }

              if (mode === 'nav') {
                if (locked && !isActive) {
                  return (
                    <span
                      key={lesson.id}
                      className="block cursor-not-allowed rounded-lg border border-[var(--stroke)] px-3 py-2.5 text-sm font-semibold text-[var(--ink-soft)] opacity-70 md:rounded-xl"
                      aria-disabled="true"
                      title="Activa el curso para acceder a esta lección"
                    >
                      {lesson.title}
                    </span>
                  );
                }

                return (
                  <Link
                    key={lesson.id}
                    href={`/cursos/${courseSlug}/${lesson.slug}`}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-semibold md:rounded-xl ${
                      isActive ? 'bg-[var(--green-700)] text-white' : 'border border-[var(--stroke)] text-[var(--ink)]'
                    }`}
                  >
                    {lesson.title}
                  </Link>
                );
              }

              return (
                <CourseLessonAccessLink
                  key={lesson.id}
                  courseSlug={courseSlug}
                  lessonSlug={lesson.slug}
                  className={baseClass}
                >
                  <span className="min-w-0 font-semibold text-[var(--ink)]">{lesson.title}</span>
                  <span className="shrink-0 text-xs text-[var(--ink-soft)]">
                    {lesson.durationMinutes ? `${lesson.durationMinutes} min` : 'Lección'}
                  </span>
                </CourseLessonAccessLink>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
