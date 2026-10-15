import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { formatEuro, getCoursePrice, getCourseStatusSummary, isCourseFree } from '@/lib/offer';
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
  const shellClass =
    layout === 'rail' ? 'saas-card-rail h-full' : 'product-card public-card public-card--hover group';

  return (
    <article className={`${shellClass} ${className}`}>
      <Link href={`/cursos/${course.slug}`} className="block">
        <div className={layout === 'rail' ? 'relative overflow-hidden rounded-xl' : 'product-card__media'}>
          <CourseCoverImage
            slug={course.slug}
            src={course.coverImage}
            className={
              layout === 'rail'
                ? 'h-36 w-full object-cover'
                : 'h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-48'
            }
            label={course.title}
          />
          {layout === 'grid' ? (
            <>
              <div className="product-card__shine" aria-hidden="true" />
              <div className="product-card__overlay" />
            </>
          ) : null}
          <span className="product-card__badge bg-white/95 text-[var(--ink)]">
            {status.sellable ? 'Curso' : 'En preparación'}
          </span>
        </div>
        <div className={layout === 'rail' ? 'mt-3' : 'product-card__body'}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            {status.statusText}
          </p>
          <h3 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-[var(--ink)] transition group-hover:text-[var(--green-700)] md:text-lg">
            {course.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[var(--ink-soft)]">
            {course.shortDescription || 'Formación práctica para preparar tu solicitud.'}
          </p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <p className="text-lg font-black text-[var(--ink)]">{priceText(course, status.sellable)}</p>
            <span className="text-xs font-bold text-[var(--green-700)]">Ver programa →</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
