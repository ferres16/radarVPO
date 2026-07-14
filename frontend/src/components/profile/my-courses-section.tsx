'use client';

import Link from 'next/link';
import { ProfileCard } from '@/components/profile-card';
import { StatusPill } from '@/components/status-pill';
import type { UserCourseProgress } from '@/types';

type MyCoursesSectionProps = {
  courses: UserCourseProgress[];
  error?: string;
};

export function MyCoursesSection({ courses, error }: MyCoursesSectionProps) {
  return (
    <ProfileCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">
            Mis cursos
          </p>
          <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">
            Tu formación activa
          </h2>
        </div>
      </div>

      {error ? (
        <p className="mt-4 text-sm text-amber-700">{error}</p>
      ) : null}

      {courses.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--stroke)] bg-[var(--bg-app)] p-6 text-center">
          <p className="font-semibold text-[var(--ink)]">Aún no tienes cursos activos.</p>
          <Link href="/cursos" className="btn btn--primary mt-4 inline-flex">
            Descubrir cursos
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {courses.map((course) => (
            <CourseProgressCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </ProfileCard>
  );
}

function CourseProgressCard({ course }: { course: UserCourseProgress }) {
  const continueHref = course.lastLesson
    ? `/cursos/${course.slug}/${course.lastLesson.slug}`
    : `/cursos/${course.slug}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] transition hover:-translate-y-0.5 hover:bg-white">
      {course.coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={course.coverImage}
          alt=""
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,#e8f7ef,#f4fbff)] text-4xl">
          📚
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[var(--ink)]">{course.title}</h3>
          {course.isCompleted ? (
            <StatusPill label="Completado" tone="active" />
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--ink-soft)]">
          {course.shortDescription || 'Curso disponible en tu cuenta.'}
        </p>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-soft)]">
            <span>Progreso</span>
            <span>{course.progressPercent}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white">
            <div
              className="h-full rounded-full bg-[var(--green-500)] transition-all"
              style={{ width: `${course.progressPercent}%` }}
            />
          </div>
        </div>
        {course.lastLesson ? (
          <p className="mt-3 text-xs text-[var(--ink-soft)]">
            Última lección: <span className="font-semibold text-[var(--ink)]">{course.lastLesson.title}</span>
          </p>
        ) : null}
        <Link href={continueHref} className="btn btn--primary btn--block mt-4">
          Continuar curso
        </Link>
      </div>
    </article>
  );
}
