import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { TrackedButtonLink } from '@/components/tracked-link';
import { getPublicCourseTitle, GUIDE_VPO_SHORT, isGuideVpoSlug } from '@/lib/guide-vpo';
import { formatEuro, getCoursePrice, getCourseStatusSummary } from '@/lib/offer';
import type { Course } from '@/types';

export function FeaturedCourseSpotlight({
  course,
  owned = false,
}: {
  course: Course;
  owned?: boolean;
}) {
  const status = getCourseStatusSummary(course);
  const price = getCoursePrice(course);
  const publicTitle = getPublicCourseTitle(course);
  const description = owned
    ? 'Ya está en tu cuenta. Entra a leerla, sin volver a pagar.'
    : isGuideVpoSlug(course.slug)
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
        {owned ? (
          <p className="spotlight-course__note">Ya está en tu cuenta. Entra a leerla.</p>
        ) : price !== null ? (
          <p className="spotlight-course__note">
            {status.sellable
              ? `${formatEuro(price)} · pago único, sin renovaciones. Pagas en esta ficha.`
              : `Precio previsto al lanzarlo: ${formatEuro(price)} (pago único)`}
          </p>
        ) : null}
        <div className="spotlight-course__actions">
          <TrackedButtonLink
            href={
              owned
                ? `/cursos/${course.slug}#guia`
                : status.sellable
                  ? `/cursos/${course.slug}#pagar`
                  : `/cursos/${course.slug}`
            }
            size="lg"
            block
            event="course_cta_clicked"
            eventProperties={{ source: 'home_spotlight', course: course.slug }}
          >
            {owned
              ? 'Abrir la guía'
              : status.sellable && price !== null
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
