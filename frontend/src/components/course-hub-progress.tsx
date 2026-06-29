import Link from 'next/link';
import type { Course, CourseModule } from '@/types';

type LessonProgressEntry = {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
};

type CourseHubProgressProps = {
  course: Course;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lessonProgress: LessonProgressEntry[];
  continueLessonSlug?: string | null;
  continueLessonTitle?: string | null;
};

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

function findLessonStatus(
  lessonId: string,
  lessonProgress: LessonProgressEntry[],
): LessonProgressEntry['status'] {
  return lessonProgress.find((entry) => entry.lessonId === lessonId)?.status || 'not_started';
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-28 w-28 shrink-0">
      <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="var(--green-500)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{percent}%</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">completado</span>
      </div>
    </div>
  );
}

export function CourseHubProgress({
  course,
  progressPercent,
  completedLessons,
  totalLessons,
  lessonProgress,
  continueLessonSlug,
  continueLessonTitle,
}: CourseHubProgressProps) {
  const modules = course.modules || [];

  return (
    <section className="shell -mt-2 pb-6">
      <div className="public-card grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
        <ProgressRing percent={progressPercent} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Tu progreso</p>
          <h2 className="mt-2 text-2xl font-black text-white">
            {progressPercent === 100
              ? '¡Curso completado!'
              : completedLessons > 0
                ? 'Sigue donde lo dejaste'
                : 'Empieza tu formación'}
          </h2>
          <p className="mt-2 text-sm text-white/75">
            {completedLessons} de {totalLessons} lecciones completadas
          </p>
          {continueLessonSlug ? (
            <Link
              href={`/cursos/${course.slug}/${continueLessonSlug}`}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]"
            >
              {continueLessonTitle ? `Continuar: ${continueLessonTitle}` : 'Continuar curso'}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="premium-card p-6">
          <h2 className="text-lg font-black text-[var(--ink)]">Índice del curso</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Estado de cada lección según tu avance.
          </p>
          <div className="mt-4 space-y-3">
            {modules.map((module: CourseModule, index: number) => (
              <details key={module.id} className="group rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 p-4" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                      Módulo {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[var(--ink)]">{module.title}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                    {module.lessons?.length || 0}
                  </span>
                </summary>
                <div className="mt-3 space-y-2">
                  {(module.lessons || []).map((lesson) => {
                    const status = findLessonStatus(lesson.id, lessonProgress);
                    return (
                      <Link
                        key={lesson.id}
                        href={`/cursos/${course.slug}/${lesson.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--stroke)] bg-white/80 px-3 py-2.5 text-sm transition hover:border-[rgba(22,112,85,0.22)] hover:shadow-sm"
                      >
                        <span className="font-semibold text-[var(--ink)]">{lesson.title}</span>
                        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${statusStyles[status]}`}>
                          {statusLabels[status]}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </article>

        <aside className="premium-card p-6">
          <h2 className="text-lg font-black text-[var(--ink)]">Resumen</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-4 py-3">
              <dt className="text-[var(--ink-soft)]">Progreso global</dt>
              <dd className="font-black text-[var(--ink)]">{progressPercent}%</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-4 py-3">
              <dt className="text-[var(--ink-soft)]">Lecciones completadas</dt>
              <dd className="font-black text-[var(--ink)]">
                {completedLessons}/{totalLessons}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-4 py-3">
              <dt className="text-[var(--ink-soft)]">Estado</dt>
              <dd className="font-black text-[var(--green-700)]">
                {progressPercent === 100 ? 'Completado' : completedLessons > 0 ? 'En progreso' : 'Sin empezar'}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
