import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { buildCourseAccessTargets } from '@/lib/course-access-targets';
import { proPlan } from '@/lib/pro';
import type { Course } from '@/types';

export type CourseBadge = 'nuevo' | 'pro' | 'incluido' | 'premium' | 'curso';

const badgeStyles: Record<CourseBadge, string> = {
  nuevo: 'bg-[var(--cyan-500)] text-[var(--ink)]',
  pro: 'bg-[var(--accent-gold)] text-[var(--ink)]',
  incluido: 'bg-[var(--green-700)] text-white',
  premium: 'bg-white/95 text-[var(--ink)]',
  curso: 'bg-white/90 text-[var(--ink)]',
};

const badgeLabels: Record<CourseBadge, string> = {
  nuevo: 'Nuevo',
  pro: 'PRO',
  incluido: 'Incluido en PRO',
  premium: 'Premium',
  curso: 'Academia',
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
  layout?: 'grid' | 'rail';
};

export function CourseProductCard({
  course,
  includedInPro = course.accessType === 'pro',
  showCta = false,
  className = '',
  layout = 'grid',
}: CourseProductCardProps) {
  const lessonCount = course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
  const badge = resolveBadge(course, includedInPro);
  const targets = buildCourseAccessTargets(course);
  const duration = lessonCount > 0 ? `${lessonCount} lecciones` : 'Próximamente';
  const ctaHref = includedInPro ? `/cursos/${course.slug}` : targets.lockedHref.startsWith('http') ? targets.lockedHref : `/cursos/${course.slug}`;
  const ctaLabel = includedInPro ? 'Acceder con PRO' : targets.lockedLabel;

  const shellClass = layout === 'rail' ? 'saas-card-rail h-full' : 'product-card public-card public-card--hover group';

  return (
    <article className={`${shellClass} ${className}`}>
      <Link href={`/cursos/${course.slug}`} className="block">
        <div className={layout === 'rail' ? 'relative overflow-hidden rounded-xl' : 'product-card__media'}>
          <CourseCoverImage
            slug={course.slug}
            src={course.coverImage}
            className={layout === 'rail' ? 'h-36 w-full object-cover' : 'h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-48'}
            label={course.title}
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
            <span>Formación práctica</span>
          </div>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--green-700)] md:text-lg">
            {course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--ink-soft)]">
            {course.shortDescription || 'Preparación clara antes de abrir el plazo.'}
          </p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-black text-[var(--ink)]">{formatPrice(course)}</p>
            <span className="text-xs font-bold text-[var(--green-700)]">Ver programa →</span>
          </div>
        </div>
      </Link>
      {showCta ? (
        <div className={layout === 'rail' ? 'mt-3 pt-0' : 'border-t border-[var(--stroke)] px-5 py-4'}>
          <Link href={ctaHref} className="btn btn--primary btn--block text-sm">
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </article>
  );
}
