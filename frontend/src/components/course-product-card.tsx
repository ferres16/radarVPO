'use client';

import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { MotionCard } from '@/components/motion-primitives';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import { getCourseLessonCount, isCourseComingSoon, isDraftCourse } from '@/lib/course-display';
import { proPlan } from '@/lib/pro';
import type { Course } from '@/types';

export type CourseBadge = 'nuevo' | 'pro' | 'incluido' | 'premium' | 'curso' | 'soon';

const badgeStyles: Record<CourseBadge, string> = {
  nuevo: 'bg-[var(--cyan-500)] text-[var(--ink)]',
  pro: 'bg-[var(--accent-gold)] text-[var(--ink)]',
  incluido: 'bg-[var(--green-700)] text-white',
  premium: 'bg-white/95 text-[var(--ink)]',
  curso: 'bg-white/90 text-[var(--ink)]',
  soon: 'bg-[var(--ink)] text-white',
};

const badgeLabels: Record<CourseBadge, string> = {
  nuevo: 'Nuevo',
  pro: 'PRO',
  incluido: 'Incluido en PRO',
  premium: 'Premium',
  curso: 'Academia',
  soon: 'Próximamente',
};

function getCourseSalePrice(course: Course) {
  const metadataSalePrice = course.seoMetadata?.salePrice;
  if (typeof metadataSalePrice === 'string' || typeof metadataSalePrice === 'number') {
    return metadataSalePrice;
  }
  return course.salePrice;
}

function formatPrice(course: Course) {
  if (isCourseComingSoon(course)) return 'Próximamente';
  const salePrice = getCourseSalePrice(course);
  const amount = salePrice || course.price;
  if (!amount) {
    return course.pricingType === 'free' ? 'Gratis' : 'Consultar';
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: course.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function resolveBadge(course: Course, includedInPro: boolean): CourseBadge {
  if (isCourseComingSoon(course)) return 'soon';
  if (includedInPro) return 'incluido';
  if (course.accessType === 'pro') return 'pro';
  if (course.pricingType === 'premium' || course.accessType === 'paid') return 'premium';
  return 'curso';
}

type CourseProductCardProps = {
  course: Course;
  includedInPro?: boolean;
  showCta?: boolean;
  className?: string;
  layout?: 'grid' | 'rail';
};

export function CourseProductCard({
  course,
  includedInPro = course.accessType === 'pro',
  showCta = false,
  className = '',
  layout = 'grid',
}: CourseProductCardProps) {
  const lessonCount = getCourseLessonCount(course);
  const comingSoon = isCourseComingSoon(course);
  const draft = isDraftCourse(course);
  const badge = resolveBadge(course, includedInPro);
  const targets = buildCourseAccessTargets(course);
  const duration = lessonCount > 0 ? `${lessonCount} lecciones` : 'En preparación';
  const ctaHref = comingSoon ? `/cursos/${course.slug}` : includedInPro ? `/cursos/${course.slug}` : targets.lockedHref.startsWith('http') ? targets.lockedHref : `/cursos/${course.slug}`;
  const ctaLabel = comingSoon ? 'Ver detalles' : includedInPro ? 'Acceder con PRO' : targets.lockedLabel;

  const shellClass = layout === 'rail' ? 'saas-card-rail h-full' : 'product-card public-card public-card--hover group';

  return (
    <MotionCard className={`${shellClass} ${className}`}>
      <Link href={`/cursos/${course.slug}`} className="block">
        <div className={layout === 'rail' ? 'relative overflow-hidden rounded-xl' : 'product-card__media'}>
          <CourseCoverImage
            slug={course.slug}
            src={course.coverImage}
            className={`${layout === 'rail' ? 'h-36 w-full object-cover' : 'h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-48'} ${comingSoon ? 'opacity-80 saturate-[0.85]' : ''}`}
            label={draft ? 'Programa en preparación' : course.title}
          />
          {layout === 'grid' ? (
            <>
              <div className="product-card__shine" aria-hidden="true" />
              <div className="product-card__overlay" />
            </>
          ) : null}
          <span className={`product-card__badge ${badgeStyles[badge]}`}>{badgeLabels[badge]}</span>
        </div>
        <div className={layout === 'rail' ? 'mt-3' : 'product-card__body'}>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            <span>{duration}</span>
            <span>·</span>
            <span>{comingSoon ? 'Academia VPO' : 'Formación práctica'}</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--green-700)] md:text-lg">
            {draft ? 'Nuevo programa VPO' : course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--ink-soft)]">
            {comingSoon
              ? 'Contenido en preparación. Muy pronto disponible en la academia.'
              : course.shortDescription || 'Preparación clara antes de abrir el plazo.'}
          </p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-black text-[var(--ink)]">{formatPrice(course)}</p>
            {!comingSoon ? <span className="text-xs font-bold text-[var(--green-700)]">Ver programa →</span> : null}
          </div>
          {includedInPro && !comingSoon ? (
            <p className="mt-2 text-xs font-semibold text-[var(--green-700)]">Incluido en {proPlan.name}</p>
          ) : null}
        </div>
      </Link>
      {showCta && !comingSoon ? (
        <div className={layout === 'rail' ? 'mt-3 pt-0' : 'border-t border-[var(--stroke)] px-5 py-4'}>
          <Link href={ctaHref} className="btn btn--primary btn--block text-sm">
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </MotionCard>
  );
}
