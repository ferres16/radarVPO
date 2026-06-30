import Link from 'next/link';
import type { Course, CourseModule } from '@/types';
import { CollapsePanel } from '@/components/collapse-panel';
import { CourseModuleIndex } from '@/components/course-module-index';

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

function ProgressRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative h-20 w-20 shrink-0 md:h-28 md:w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
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
        <span className="text-xl font-black text-white md:text-2xl">{percent}%</span>
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-white/60 md:text-[10px]">hecho</span>
      </div>
    </div>
  );
}

function SummaryStats({
  progressPercent,
  completedLessons,
  totalLessons,
}: {
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
}) {
  return (
    <dl className="space-y-2 text-sm md:space-y-3">
      <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-3 py-2.5 md:px-4 md:py-3">
        <dt className="text-[var(--ink-soft)]">Progreso global</dt>
        <dd className="font-black text-[var(--ink)]">{progressPercent}%</dd>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-3 py-2.5 md:px-4 md:py-3">
        <dt className="text-[var(--ink-soft)]">Lecciones completadas</dt>
        <dd className="font-black text-[var(--ink)]">
          {completedLessons}/{totalLessons}
        </dd>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)]/60 px-3 py-2.5 md:px-4 md:py-3">
        <dt className="text-[var(--ink-soft)]">Estado</dt>
        <dd className="font-black text-[var(--green-700)]">
          {progressPercent === 100 ? 'Completado' : completedLessons > 0 ? 'En progreso' : 'Sin empezar'}
        </dd>
      </div>
    </dl>
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
    <section className="shell pb-4 pt-2 md:pb-6 md:pt-3">
      <div className="course-progress-card grid w-full gap-4 p-4 md:grid-cols-[auto_1fr] md:items-center md:gap-6 md:p-6">
        <ProgressRing percent={progressPercent} />
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60 md:text-xs">Tu progreso</p>
          <h2 className="mt-1 text-xl font-black text-white md:mt-2 md:text-2xl">
            {progressPercent === 100
              ? '¡Curso completado!'
              : completedLessons > 0
                ? 'Sigue donde lo dejaste'
                : 'Empieza tu formación'}
          </h2>
          <p className="mt-1 text-sm text-white/75">
            {completedLessons} de {totalLessons} lecciones completadas
          </p>
          <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
              {progressPercent}% global
            </span>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white">
              {progressPercent === 100 ? 'Completado' : completedLessons > 0 ? 'En progreso' : 'Sin empezar'}
            </span>
          </div>
          {continueLessonSlug ? (
            <Link
              href={`/cursos/${course.slug}/${continueLessonSlug}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)] transition hover:bg-[var(--bg-eco)] sm:mt-4 sm:w-auto sm:px-5"
            >
              {continueLessonTitle ? `Continuar: ${continueLessonTitle}` : 'Continuar curso'}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="course-hub-grid mt-3 md:mt-4">
        <CollapsePanel
          title="Índice del curso"
          subtitle="Módulos y lecciones de tu curso"
          meta={`${totalLessons} lecc.`}
          alwaysOpenFrom="lg"
          className="premium-card w-full p-4 md:p-5"
          bodyClassName="!border-t-0 !pt-3 lg:!pt-0"
        >
          <CourseModuleIndex
            courseSlug={course.slug}
            modules={modules}
            mode="progress"
            lessonProgress={lessonProgress}
            defaultOpenFirst
          />
        </CollapsePanel>

        <CollapsePanel
          title="Resumen"
          subtitle="Progreso y estado del curso"
          className="premium-card w-full p-4 lg:hidden"
          bodyClassName="!pt-3"
        >
          <SummaryStats
            progressPercent={progressPercent}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
          />
        </CollapsePanel>

        <aside className="premium-card hidden w-full p-4 md:p-5 lg:block">
          <h2 className="text-lg font-black text-[var(--ink)]">Resumen</h2>
          <div className="mt-4">
            <SummaryStats
              progressPercent={progressPercent}
              completedLessons={completedLessons}
              totalLessons={totalLessons}
            />
          </div>
        </aside>
      </div>
    </section>
  );
}
