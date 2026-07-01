import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeHowItWorks } from '@/components/conversion/home-how-it-works';
import { HomeProIncludes } from '@/components/conversion/home-pro-includes';
import { HomeTestimonials } from '@/components/conversion/home-testimonials';
import { HeroProof } from '@/components/conversion/hero-proof';
import { ButtonLink } from '@/components/design-system';
import { Reveal } from '@/components/motion-primitives';
import { ProComparison } from '@/components/pro-comparison';
import { ProductPreviewMotion } from '@/components/saas/product-preview-motion';
import { TrustMetrics } from '@/components/saas/trust-metrics';
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

      <main className="lp lp--app">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="hero-split">
              <div className="lp-hero__inner order-2 md:order-1">
                <span className="lp-hero__badge">VPO PRO · Cataluña</span>
                <h1 id="hero-title" className="lp-hero__title">
                  No llegues tarde
                  <span className="lp-hero__title-accent"> a tu próxima VPO.</span>
                </h1>
                <p className="lp-hero__subtitle">
                  Radar VPO monitoriza promociones y lanzamientos, te avisa al móvil y te prepara antes del plazo.
                </p>
                <div className="lp-hero__actions lp-hero__actions--stack">
                  <ButtonLink href={proHref} size="lg" block>
                    {proPlan.ctaLabel}
                  </ButtonLink>
                  <ButtonLink href="/register" variant="secondary" size="lg" block>
                    Crear cuenta gratis
                  </ButtonLink>
                </div>
                <p className="lp-hero__price">{proPlan.price} · pago seguro · sin permanencia</p>
                <HeroProof />
              </div>
              <div className="order-1 md:order-2">
                <ProductPreviewMotion />
              </div>
            </div>
          </div>
        </section>

        <Reveal>
          <section className="lp-section lp-section--muted" aria-label="Métricas">
            <div className="shell">
              <TrustMetrics />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="lp-section" aria-labelledby="problem-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">El problema</p>
                <h2 id="problem-title" className="lp-title">
                  La mayoría pierde la oportunidad antes de empezar
                </h2>
                <p className="lp-lead">Llegar tarde cuesta plazos, documentación y tranquilidad.</p>
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
        </Reveal>

        <HomeHowItWorks />

        <Reveal>
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
              <div className="lp-section__cta">
                <ButtonLink href={proHref} size="lg" block>
                  {proPlan.ctaLabel}
                </ButtonLink>
              </div>
            </div>
          </section>
        </Reveal>

        <HomeProIncludes />

        <Reveal>
          <section className="lp-section">
            <div className="shell">
              <ProComparison />
            </div>
          </section>
        </Reveal>

        {featuredCourse ? (
          <Reveal>
            <section className="lp-section lp-section--muted" aria-labelledby="courses-title">
              <div className="shell">
                <div className="lp-section__head">
                  <p className="lp-eyebrow">Formación incluida</p>
                  <h2 id="courses-title" className="lp-title">
                    Academia VPO incluida en PRO
                  </h2>
                  <p className="lp-lead">
                    Aprende requisitos, documentación y errores frecuentes sin improvisar cuando abra el plazo.
                  </p>
                </div>
                <FeaturedCourseSpotlight course={featuredCourse} />
              </div>
            </section>
          </Reveal>
        ) : null}

        <Reveal>
          <section className="lp-section">
            <div className="shell">
              <HomeTestimonials />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="lp-section lp-section--border">
            <div className="shell">
              <HomeFaq />
            </div>
          </section>
        </Reveal>

        <Reveal>
          <section className="lp-section lp-section--muted">
            <div className="shell">
              <div className="public-cta-band">
                <div>
                  <h2 className="lp-title lp-title--sm">Empieza hoy con VPO PRO</h2>
                  <p className="lp-lead">Recibe alertas por SMS y email cuando detectemos oportunidades en tu zona.</p>
                </div>
                <div className="public-cta-band__actions lp-hero__actions--stack">
                  <ButtonLink href={proHref} size="lg" block>
                    {proPlan.ctaLabel}
                  </ButtonLink>
                  <ButtonLink href="/register" variant="secondary" size="lg" block>
                    Crear cuenta gratis
                  </ButtonLink>
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      </main>
    </>
  );
}
