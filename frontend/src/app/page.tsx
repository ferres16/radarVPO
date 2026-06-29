import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeTestimonials } from '@/components/conversion/home-testimonials';
import { HeroProof } from '@/components/conversion/hero-proof';
import { ButtonLink } from '@/components/design-system';
import { ProComparison } from '@/components/pro-comparison';
import { SiteFooter } from '@/components/site-footer';
import { StickyProCta } from '@/components/sticky-pro-cta';
import { StructuredData } from '@/components/structured-data';
import { homeFaqs, homeProblemCards, homeSolutionBlocks } from '@/lib/conversion';
import { proHref, proPlan } from '@/lib/pro';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Alertas VPO y vivienda protegida en Cataluña — llega antes con VPO PRO',
  description:
    'No vuelvas a llegar tarde a una promoción de VPO. Alertas por email y SMS, próximos lanzamientos, curso VPO y checklist para pisos protegidos en Cataluña.',
  path: '/',
  keywords: [
    'vivienda protegida Cataluña',
    'VPO Cataluña',
    'HPO Cataluña',
    'promociones VPO',
    'pisos protegidos',
    'alertas vivienda protegida',
    'curso VPO',
  ],
});

export default async function Home() {
  const courses = await api.listCourses().catch(() => []);
  const featuredCourse = [...courses].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))[0];

  return (
    <>
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd([...homeFaqs])]} />
      <StickyProCta />

      <main className="lp">
        {/* 1. HERO */}
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell lp-hero__inner">
            <span className="lp-hero__badge">VPO PRO · Cataluña</span>
            <h1 id="hero-title" className="lp-hero__title">
              No vuelvas a llegar tarde
              <span className="lp-hero__title-accent"> a una promoción de VPO.</span>
            </h1>
            <p className="lp-hero__subtitle">
              Alertas antes que el resto, preparación real y ventaja cuando abre el plazo.
              Todo en una suscripción.
            </p>
            <div className="lp-hero__actions">
              <ButtonLink href={proHref} size="lg">
                Empieza con VPO PRO
              </ButtonLink>
              <ButtonLink href="/promotions" variant="secondary" size="lg">
                Ver promociones
              </ButtonLink>
            </div>
            <p className="lp-hero__price">{proPlan.price} · cancela cuando quieras</p>
            <HeroProof />
          </div>
        </section>

        {/* 2. PROBLEMA */}
        <section className="lp-section" aria-labelledby="problem-title">
          <div className="shell">
            <div className="lp-section__head lp-section__head--center">
              <p className="lp-eyebrow">El problema</p>
              <h2 id="problem-title" className="lp-title">
                La mayoría pierde la oportunidad antes de empezar
              </h2>
            </div>
            <div className="lp-problem-grid">
              {homeProblemCards.map((card) => (
                <article key={card.title} className="lp-problem-card">
                  <span className="lp-problem-card__mark" aria-hidden="true">✕</span>
                  <h3 className="lp-problem-card__title">{card.title}</h3>
                  <p className="lp-problem-card__text">{card.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 3. SOLUCIÓN */}
        <section className="lp-section lp-section--muted" aria-labelledby="solution-title">
          <div className="shell">
            <div className="lp-section__head">
              <p className="lp-eyebrow">La solución</p>
              <h2 id="solution-title" className="lp-title">
                Radar VPO trabaja mientras tú te preparas
              </h2>
            </div>
            <div className="lp-solution-grid">
              {homeSolutionBlocks.map((block) => (
                <article key={block.step} className="lp-solution-card">
                  <span className="lp-solution-card__step">{block.step}</span>
                  <h3 className="lp-solution-card__title">{block.title}</h3>
                  <p className="lp-solution-card__text">{block.description}</p>
                </article>
              ))}
            </div>
            <div className="lp-section__cta">
              <ButtonLink href={proHref} size="lg">
                {proPlan.ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* 4. COMPARATIVA */}
        <section className="lp-section">
          <div className="shell">
            <ProComparison />
          </div>
        </section>

        {/* 5. CURSOS */}
        {featuredCourse ? (
          <section className="lp-section lp-section--border" aria-labelledby="courses-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">Formación incluida</p>
                <h2 id="courses-title" className="lp-title">
                  El curso que te prepara para el plazo
                </h2>
                <p className="lp-lead">
                  Incluido en VPO PRO. Aprende requisitos, documentación y errores frecuentes sin improvisar.
                </p>
              </div>
              <FeaturedCourseSpotlight course={featuredCourse} />
            </div>
          </section>
        ) : null}

        {/* 6. TESTIMONIOS */}
        <div className="shell">
          <HomeTestimonials />
        </div>

        {/* 7. FAQ */}
        <div className="shell">
          <HomeFaq />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
