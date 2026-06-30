'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCourseAccess } from '@/components/course-access';
import { CourseHubProgress } from '@/components/course-hub-progress';
import { api } from '@/lib/api';
import type { Course } from '@/types';

type CourseProgressState = {
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  lastLessonId?: string | null;
  lessons: Array<{ lessonId: string; status: 'not_started' | 'in_progress' | 'completed' }>;
};

type CourseHubSectionProps = {
  course: Course;
  lessonCount: number;
};

function findLessonById(course: Course, lessonId?: string | null) {
  if (!lessonId) return null;
  for (const module of course.modules || []) {
    const lesson = (module.lessons || []).find((item) => item.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
}

export function CourseHubSection({ course, lessonCount }: CourseHubSectionProps) {
  const { canAccess, resolved } = useCourseAccess();
  const [progress, setProgress] = useState<CourseProgressState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resolved || !canAccess || lessonCount === 0) {
      setProgress(null);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    void api
      .getCourseProgress(course.slug)
      .then((data) => {
        if (!active) return;
        setProgress(data);
      })
      .catch(() => {
        if (!active) return;
        setProgress({
          progressPercent: 0,
          completedLessons: 0,
          totalLessons: lessonCount,
          lastLessonId: null,
          lessons: [],
        });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canAccess, course.slug, lessonCount, resolved]);

  const resumeLesson = useMemo(() => {
    if (!progress) return null;
    const continueLesson = findLessonById(course, progress.lastLessonId);
    if (continueLesson) return continueLesson;

    const completedIds = new Set(
      progress.lessons
        .filter((entry) => entry.status === 'completed')
        .map((entry) => entry.lessonId),
    );

    for (const module of course.modules || []) {
      for (const lesson of module.lessons || []) {
        if (!completedIds.has(lesson.id)) {
          return lesson;
        }
      }
    }

    return null;
  }, [course, progress]);

  if (!resolved || !canAccess || lessonCount === 0) {
    return null;
  }

  if (loading && !progress) {
    return (
      <section className="shell -mt-2 pb-6">
        <div className="course-progress-card animate-pulse p-4 md:p-6">
          <div className="h-28 w-28 rounded-full bg-white/10" />
          <p className="mt-4 text-sm text-white/70">Cargando tu progreso...</p>
        </div>
      </section>
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <CourseHubProgress
      course={course}
      progressPercent={progress.progressPercent}
      completedLessons={progress.completedLessons}
      totalLessons={progress.totalLessons}
      lessonProgress={progress.lessons}
      continueLessonSlug={resumeLesson?.slug}
      continueLessonTitle={resumeLesson?.title}
    />
  );
}
