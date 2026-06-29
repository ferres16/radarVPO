import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import { proPlan } from '@/lib/pro';
import type { Course } from '@/types';

export type CourseBadge = 'nuevo' | 'pro' | 'incluido' | 'premium' | 'curso';

const badgeStyles: Record<CourseBadge, string> = {
  nuevo: 'bg-[var(--cyan-500)] text-[var(--ink)]',
  pro: 'bg-[var(--accent-gold)] text-[var(--ink)]',
  incluido: 'bg-[var(--green-700)] text-white shadow-glow',
  premium: 'bg-white/95 text-[var(--ink)]',
  curso: 'bg-white/90 text-[var(--ink)]',
};

const badgeLabels: Record<CourseBadge, string> = {
  nuevo: 'Nuevo',
  pro: 'PRO',
  incluido: 'Incluido en PRO',
  premium: 'Premium',
  curso: 'Curso',
};

function getCourseSalePrice(course: Course) {
  const metadataSalePrice = course.seoMetadata?.salePrice;
  if (typeof metadataSalePrice === 'string' || typeof metadataSalePrice === 'number') {
    return metadataSalePrice;
  }
  return course.salePrice;
}

function formatPrice(course: Course) {
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
};

export function CourseProductCard({
  course,
  includedInPro = course.accessType === 'pro',
  showCta = false,
  className = '',
}: CourseProductCardProps) {
  const lessonCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
  const badge = resolveBadge(course, includedInPro);
  const targets = buildCourseAccessTargets(course);
  const duration = lessonCount > 0 ? `${lessonCount} lecciones` : 'Próximamente';

  return (
    <article className={`product-card public-card public-card--hover group ${className}`}>
      <Link href={`/cursos/${course.slug}`} className="block">
        <div className="product-card__media">
          <CourseCoverImage
            src={course.coverImage}
            className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-52"
            label={course.title}
          />
          <div className="product-card__shine" aria-hidden="true" />
          <div className="product-card__overlay" />
          <span className={`product-card__badge ${badgeStyles[badge]}`}>{badgeLabels[badge]}</span>
        </div>
        <div className="product-card__body">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            <span>{duration}</span>
          </div>
          <h3 className="mt-2 text-lg font-black text-[var(--ink)] transition group-hover:text-[var(--green-700)] md:text-xl">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--ink-soft)]">
            {course.shortDescription || 'Formación práctica para prepararte antes del plazo.'}
          </p>
          <div className="mt-4 flex items-end justify-between gap-3">
            <p className="text-xl font-black text-[var(--ink)]">{formatPrice(course)}</p>
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--green-700)]">
              Ver curso →
            </span>
          </div>
        </div>
      </Link>
      {showCta ? (
        <div className="border-t border-[var(--stroke)] px-5 py-4">
          <Link
            href={targets.lockedHref.startsWith('http') ? targets.lockedHref : `/cursos/${course.slug}`}
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black"
          >
            {includedInPro ? proPlan.ctaLabel : targets.lockedLabel}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
