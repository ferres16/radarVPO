import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { ButtonLink } from '@/components/design-system';
import { proPlan } from '@/lib/pro';
import type { Course } from '@/types';

function lessonCount(course: Course) {
  return course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0;
}

function formatPrice(course: Course) {
  const amount = course.salePrice || course.price;
  if (!amount) {
    return course.accessType === 'pro' ? `Incluido en ${proPlan.name}` : 'Consultar';
  }
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: course.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function FeaturedCourseSpotlight({ course }: { course: Course }) {
  const lessons = lessonCount(course);
  const includedInPro = course.accessType === 'pro';

  return (
    <article className="spotlight-course">
      <Link href={`/cursos/${course.slug}`} className="spotlight-course__media">
        <CourseCoverImage
          slug={course.slug}
          src={course.coverImage}
          alt=""
          className="h-full w-full object-cover"
          label={course.title}
        />
      </Link>
      <div className="spotlight-course__body">
        <div className="spotlight-course__meta">
          <span>{lessons > 0 ? `${lessons} lecciones` : 'En actualización'}</span>
          <span>·</span>
          <span>Todos los niveles</span>
          {includedInPro ? (
            <>
              <span>·</span>
              <span className="spotlight-course__pro">Incluido en PRO</span>
            </>
          ) : null}
        </div>
        <h3 className="spotlight-course__title">
          <Link href={`/cursos/${course.slug}`}>{course.title}</Link>
        </h3>
        <p className="spotlight-course__desc">
          {course.shortDescription || 'Formación práctica para solicitar vivienda protegida con criterio.'}
        </p>
        <div className="spotlight-course__stats" aria-label="Métricas del curso (estimadas)">
          <div>
            <p className="spotlight-course__stat-value">4,8</p>
            <p className="spotlight-course__stat-label">Valoración</p>
          </div>
          <div>
            <p className="spotlight-course__stat-value">+120</p>
            <p className="spotlight-course__stat-label">Alumnos</p>
          </div>
          <div>
            <p className="spotlight-course__stat-value">{formatPrice(course)}</p>
            <p className="spotlight-course__stat-label">Precio</p>
          </div>
        </div>
        <div className="spotlight-course__actions">
          <ButtonLink href={`/cursos/${course.slug}`} size="lg">
            {includedInPro ? 'Ver Guía VPO incluida en PRO' : 'Comprar curso'}
          </ButtonLink>
        </div>
        <p className="spotlight-course__note">Valoración y alumnos: datos orientativos de lanzamiento.</p>
      </div>
    </article>
  );
}
