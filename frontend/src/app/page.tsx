import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeTestimonials } from '@/components/conversion/home-testimonials';
import { HeroProof } from '@/components/conversion/hero-proof';
import { HomeFinalCtaBand, HomeHeroActions, HomeHeroPriceLine, HomeSolutionCta } from '@/components/conversion/home-pro-ctas';
import { ProComparison } from '@/components/pro-comparison';
import { ProductPreview } from '@/components/saas/product-preview';
import { TrustMetrics } from '@/components/saas/trust-metrics';
import { StructuredData } from '@/components/structured-data';
import { homeFaqs, homeProblemCards, homeSolutionBlocks } from '@/lib/conversion';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Vivienda pública Cataluña — promociones VPO, lanzamientos y alertas',
  description:
    'Encuentra vivienda pública y protegida en Cataluña. Promociones VPO/HPO abiertas, próximos lanzamientos, noticias y avisos por email y SMS con VPO PRO.',
  path: '/',
  keywords: [
    'vivienda pública cataluña',
    'vivienda publica catalunya',
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

      <main className="lp lp--app">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="hero-split">
              <div className="lp-hero__inner order-2 md:order-1">
                <span className="lp-hero__badge">VPO PRO · Cataluña</span>
                <h1 id="hero-title" className="lp-hero__title">
                  Vivienda pública en Cataluña.
                  <span className="lp-hero__title-accent"> Llega antes a cada promoción VPO.</span>
                </h1>
                <p className="lp-hero__subtitle">
                  Promociones abiertas, próximos lanzamientos y noticias de vivienda protegida (VPO/HPO). Gratis en la web; con PRO, avisos por email y SMS y el curso Guía VPO.
                </p>
                <HomeHeroActions />
                <HomeHeroPriceLine />
                <HeroProof />
              </div>
              <div className="order-1 hidden md:block md:order-2">
                <ProductPreview />
              </div>
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--muted" aria-label="Métricas">
          <div className="shell">
            <TrustMetrics />
          </div>
        </section>

        <section className="lp-section" aria-labelledby="problem-title">
          <div className="shell">
            <div className="lp-section__head">
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

        <section className="lp-section lp-section--border" aria-labelledby="solution-title">
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
            <HomeSolutionCta />
          </div>
        </section>

        <section className="lp-section">
          <div className="shell">
            <ProComparison />
          </div>
        </section>

        {featuredCourse ? (
          <section className="lp-section lp-section--muted" aria-labelledby="courses-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">Formación incluida</p>
                <h2 id="courses-title" className="lp-title">
                  El curso que te prepara para el plazo
                </h2>
                <p className="lp-lead">
                  Incluido en VPO PRO. El curso Guía VPO te prepara requisitos, documentación y errores frecuentes.
                </p>
              </div>
              <FeaturedCourseSpotlight course={featuredCourse} />
            </div>
          </section>
        ) : null}

        <section className="lp-section">
          <div className="shell">
            <HomeTestimonials />
          </div>
        </section>

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
