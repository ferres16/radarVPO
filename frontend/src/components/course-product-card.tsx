import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { getPublicCourseTitle, GUIDE_VPO_SHORT, isGuideVpoSlug } from '@/lib/guide-vpo';
import {
  formatEuro,
  getCoursePrice,
  getCourseStatusSummary,
  isCourseFree,
  isGuidePdf,
} from '@/lib/offer';
import type { Course } from '@/types';

type CourseProductCardProps = {
  course: Course;
  className?: string;
  layout?: 'grid' | 'rail';
};

function priceText(course: Course, sellable: boolean) {
  if (isCourseFree(course)) return 'Gratis';
  const price = getCoursePrice(course);
  if (price === null) return 'Consultar';
  return sellable ? formatEuro(price) : `Previsto: ${formatEuro(price)}`;
}

export function CourseProductCard({ course, className = '', layout = 'grid' }: CourseProductCardProps) {
  const status = getCourseStatusSummary(course);
  const guide = isGuidePdf(course);
  const publicTitle = getPublicCourseTitle(course);
  const shellClass =
    layout === 'rail' ? 'saas-card-rail h-full' : 'product-card public-card public-card--hover group';

  const href = status.sellable ? `/cursos/${course.slug}#pagar` : `/cursos/${course.slug}`;

  return (
    <article className={`${shellClass} ${className}`}>
      <Link href={href} className="block">
        <div className={layout === 'rail' ? 'relative overflow-hidden rounded-xl' : 'product-card__media'}>
          <CourseCoverImage
            slug={course.slug}
            src={course.coverImage}
            className={
              layout === 'rail'
                ? 'h-36 w-full object-cover object-top'
                : 'h-44 w-full object-cover object-top transition duration-500 group-hover:scale-[1.03] md:h-48'
            }
            label={publicTitle}
          />
          {layout === 'grid' ? (
            <>
              <div className="product-card__shine" aria-hidden="true" />
              <div className="product-card__overlay" />
            </>
          ) : null}
          <span className="product-card__badge bg-white/95 text-[var(--ink)]">
            {status.sellable ? (guide ? 'Guía PDF' : 'Guía') : 'En preparación'}
          </span>
        </div>
        <div className={layout === 'rail' ? 'mt-3' : 'product-card__body'}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            {status.statusText}
          </p>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--green-700)] md:text-lg">
            {publicTitle}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--ink-soft)]">
            {isGuideVpoSlug(course.slug)
              ? GUIDE_VPO_SHORT
              : course.shortDescription ||
                (guide
                  ? 'Guía clara para decidir con criterio.'
                  : 'Formación práctica sobre vivienda protegida.')}
          </p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-black text-[var(--ink)]">{priceText(course, status.sellable)}</p>
            <span className="text-xs font-bold text-[var(--green-700)]">
              {status.sellable
                ? `Pagar ${priceText(course, status.sellable)} →`
                : guide
                  ? 'Ver guía →'
                  : 'Ver programa →'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
