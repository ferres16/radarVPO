import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { TrackedButtonLink } from '@/components/tracked-link';
import { getPublicCourseTitle, GUIDE_VPO_SHORT, isGuideVpoSlug } from '@/lib/guide-vpo';
import { formatEuro, getCoursePrice, getCourseStatusSummary } from '@/lib/offer';
import type { Course } from '@/types';

export function FeaturedCourseSpotlight({ course }: { course: Course }) {
  const status = getCourseStatusSummary(course);
  const price = getCoursePrice(course);
  const publicTitle = getPublicCourseTitle(course);
  const description = isGuideVpoSlug(course.slug)
    ? GUIDE_VPO_SHORT
    : course.shortDescription ||
      'Guía para entender el contexto, las ayudas y el presupuesto de una vivienda protegida.';

  return (
    <article className="spotlight-course">
      <Link href={`/cursos/${course.slug}`} className="spotlight-course__media">
        <CourseCoverImage
          slug={course.slug}
          src={course.coverImage}
          alt=""
          className="h-full w-full object-cover object-top"
          label={publicTitle}
        />
      </Link>
      <div className="spotlight-course__body">
        <div className="spotlight-course__meta">
          <span>{status.statusText}</span>
          {!status.sellable ? (
            <>
              <span>·</span>
              <span>En preparación</span>
            </>
          ) : null}
        </div>
        <h3 className="spotlight-course__title">
          <Link href={`/cursos/${course.slug}`}>{publicTitle}</Link>
        </h3>
        <p className="spotlight-course__desc">{description}</p>
        {price !== null ? (
          <p className="spotlight-course__note">
            {status.sellable
              ? `${formatEuro(price)} · pago único, sin renovaciones. Pagas en esta ficha.`
              : `Precio previsto al lanzarlo: ${formatEuro(price)} (pago único)`}
          </p>
        ) : null}
        <div className="spotlight-course__actions">
          <TrackedButtonLink
            href={status.sellable ? `/cursos/${course.slug}#pagar` : `/cursos/${course.slug}`}
            size="lg"
            block
            event="course_cta_clicked"
            eventProperties={{ source: 'home_spotlight', course: course.slug }}
          >
            {status.sellable && price !== null
              ? `Pagar ${formatEuro(price)}`
              : isGuideVpoSlug(course.slug)
                ? 'Ver la guía'
                : 'Ver el curso'}
          </TrackedButtonLink>
        </div>
      </div>
    </article>
  );
}
