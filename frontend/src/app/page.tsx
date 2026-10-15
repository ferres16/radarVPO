import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/design-system';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeFinalCtaBand, HomeHeroActions } from '@/components/conversion/home-pro-ctas';
import { StructuredData } from '@/components/structured-data';
import { homeFaqs, homePaths, homeProblemCards } from '@/lib/conversion';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Prepara tus solicitudes de vivienda protegida en Cataluña',
  description:
    'Consulta promociones de vivienda protegida con su documento oficial, aprende a preparar tu solicitud con un curso y organiza tus oportunidades en un solo lugar.',
  path: '/',
  keywords: [
    'vivienda protegida Cataluña',
    'VPO Cataluña',
    'HPO Cataluña',
    'promociones VPO',
    'registro de solicitantes vivienda protegida',
    'curso VPO',
  ],
});

export default async function Home() {
  const courses = await api.listCourses().catch(() => []);
  const sortedCourses = [...courses].sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title),
  );
  const featuredCourse =
    sortedCourses.find((course) => course.slug === 'vpo-inicial') ?? sortedCourses[0];

  return (
    <>
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd([...homeFaqs])]} />

      <main className="lp lp--app">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="lp-hero__inner">
              <span className="lp-hero__badge">Vivienda protegida · Cataluña</span>
              <h1 id="hero-title" className="lp-hero__title">
                Aprende a preparar tus solicitudes de vivienda protegida
                <span className="lp-hero__title-accent"> y organiza tus oportunidades en un solo lugar.</span>
              </h1>
              <p className="lp-hero__subtitle">
                Para quien quiere optar a una VPO o HPO y no sabe por dónde empezar: consulta las promociones con su
                documento oficial, entiende el proceso con un curso práctico y sigue tu preparación.
              </p>
              <HomeHeroActions />
            </div>
          </div>
        </section>

        <section className="lp-section" aria-labelledby="problem-title">
          <div className="shell">
            <div className="lp-section__head">
              <p className="lp-eyebrow">El problema</p>
              <h2 id="problem-title" className="lp-title">
                Solicitar una vivienda protegida es un proceso con muchos pasos
              </h2>
            </div>
            <div className="lp-problem-grid">
              {homeProblemCards.map((card) => (
                <article key={card.title} className="lp-problem-card">
                  <h3 className="lp-problem-card__title">{card.title}</h3>
                  <p className="lp-problem-card__text">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--border" aria-labelledby="paths-title">
          <div className="shell">
            <div className="lp-section__head">
              <p className="lp-eyebrow">Cómo empezar</p>
              <h2 id="paths-title" className="lp-title">
                Empieza por lo que necesites hoy
              </h2>
            </div>
            <div className="lp-solution-grid">
              {homePaths.map((path) => (
                <article key={path.id} className="lp-solution-card">
                  <span className="lp-solution-card__step">{path.eyebrow}</span>
                  <h3 className="lp-solution-card__title">{path.title}</h3>
                  <p className="lp-solution-card__text">{path.description}</p>
                  <div className="mt-4">
                    <ButtonLink href={path.href} variant={path.id === 'consult' ? 'primary' : 'secondary'}>
                      {path.cta}
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {featuredCourse ? (
          <section className="lp-section lp-section--muted" aria-labelledby="courses-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">Formación</p>
                <h2 id="courses-title" className="lp-title">
                  Un curso para entender el proceso
                </h2>
              </div>
              <FeaturedCourseSpotlight course={featuredCourse} />
            </div>
          </section>
        ) : null}

        <section className="lp-section lp-section--border">
          <div className="shell">
            <HomeFaq />
          </div>
        </section>

        <section className="lp-section lp-section--muted">
          <div className="shell">
            <HomeFinalCtaBand />
          </div>
        </section>
      </main>
    </>
  );
}
