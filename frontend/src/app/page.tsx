import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/design-system';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeFinalCtaBand, HomeHeroActions } from '@/components/conversion/home-pro-ctas';
import { HomeOfferStrip } from '@/components/conversion/home-offer-strip';
import { PdfViewerDemo } from '@/components/conversion/pdf-viewer-demo';
import { ProofStats } from '@/components/conversion/proof-stats';
import { SpaceDemo } from '@/components/conversion/space-demo';
import { PromotionCard } from '@/components/promotion-card';
import { StructuredData } from '@/components/structured-data';
import { buildProofItems } from '@/lib/catalog-stats';
import { homeFaqs } from '@/lib/conversion';
import { formatEuro, getCoursePrice, isCourseSellable } from '@/lib/offer';
import { pickFeaturedPublicCourse } from '@/lib/public-courses';
import { publicPublishedPromotions, uniqueMunicipalities } from '@/lib/public-promotions';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Consulta promociones de vivienda protegida en Cataluña',
  description:
    'Consulta promociones de vivienda protegida con su documento oficial, entiende el contexto con una guía y organiza tus oportunidades en un solo lugar.',
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
  const [courses, promotions, stats] = await Promise.all([
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=100').catch(() => []),
    api.getCatalogStats().catch(() => null),
  ]);
  const featuredCourse = pickFeaturedPublicCourse(courses);
  const featuredSellable = featuredCourse ? isCourseSellable(featuredCourse) : false;
  const featuredPrice = featuredCourse ? getCoursePrice(featuredCourse) : null;
  const featuredHref = featuredCourse
    ? featuredSellable
      ? `/cursos/${featuredCourse.slug}#pagar`
      : `/cursos/${featuredCourse.slug}`
    : '/cursos';
  const featuredCta =
    featuredSellable && featuredPrice !== null
      ? `Comprar guía · ${formatEuro(featuredPrice)}`
      : 'Ver las guías';
  const listed = publicPublishedPromotions(promotions);
  const previewPromotions = listed.slice(0, 3);
  const samplePromotion = previewPromotions[0];
  const proofItems = buildProofItems(stats, {
    published: listed.length,
    municipalities: uniqueMunicipalities(listed).length,
  });

  return (
    <>
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd([...homeFaqs])]} />

      <main className="lp lp--app">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="lp-hero__split">
              <div className="lp-hero__inner">
                <span className="lp-hero__badge">Vivienda protegida · Cataluña</span>
                <h1 id="hero-title" className="lp-hero__title">
                  Consulta la vivienda protegida en Cataluña
                  <span className="lp-hero__title-accent"> con el PDF oficial, las guías y tus oportunidades.</span>
                </h1>
                <p className="lp-hero__subtitle">
                  {featuredSellable && featuredPrice !== null
                    ? `Guía ${formatEuro(featuredPrice)} pago único: entiende el proceso de la VPO y qué preparar. Consultar promociones es gratis.`
                    : 'Empieza gratis en el móvil. Sin cuenta para consultar las bases. La guía ordena el proceso de la VPO; PRO avisa por SMS.'}
                </p>
                <HomeHeroActions guideHref={featuredHref} guideCta={featuredCta} />
                <ProofStats items={proofItems} />
              </div>
              {samplePromotion ? <PdfViewerDemo promotion={samplePromotion} /> : null}
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--border" aria-labelledby="offer-title">
          <div className="shell">
            <div className="lp-section__head">
              <p className="lp-eyebrow">Qué puedes hacer</p>
              <h2 id="offer-title" className="lp-title">
                Gratis, curso o suscripción: una acción por camino
              </h2>
            </div>
            <HomeOfferStrip
              guide={
                featuredSellable && featuredPrice !== null
                  ? {
                      href: featuredHref,
                      price: formatEuro(featuredPrice),
                      cta: featuredCta,
                    }
                  : undefined
              }
            />
          </div>
        </section>

        {previewPromotions.length > 0 ? (
          <section className="lp-section lp-section--muted" aria-labelledby="promos-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">Gratis</p>
                <h2 id="promos-title" className="lp-title">
                  Promociones publicadas, con su documento oficial
                </h2>
                <p className="lp-lead">Abre las bases sin registrarte. El visor funciona en el móvil y en el ordenador.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {previewPromotions.map((promotion) => (
                  <PromotionCard key={promotion.id} promotion={promotion} layout="grid" animated={false} />
                ))}
              </div>
              <div className="mt-6">
                <ButtonLink href="/promotions" className="w-full sm:w-auto">
                  Ver todas las promociones
                </ButtonLink>
              </div>
            </div>
          </section>
        ) : null}

        {featuredCourse ? (
          <section className="lp-section" aria-labelledby="courses-title">
            <div className="shell">
              <div className="lp-section__head">
                <p className="lp-eyebrow">Guía</p>
                <h2 id="courses-title" className="lp-title">
                  Una guía para entender el proceso y qué preparar
                </h2>
                <p className="lp-lead">
                  Pago único. Registro, papeles, tipos de promoción y pasos hasta la firma. El precio final se ve
                  antes de pagar.
                </p>
              </div>
              <FeaturedCourseSpotlight course={featuredCourse} />
            </div>
          </section>
        ) : null}

        <section className="lp-section lp-section--muted lp-section--border" aria-labelledby="space-title">
          <div className="shell lp-hero__split">
            <div>
              <p className="lp-eyebrow">PRO</p>
              <h2 id="space-title" className="lp-title">
                Organiza lo que sigues, en tu cuenta
              </h2>
              <p className="lp-lead">
                Los marcadores de un navegador se pierden al cambiar de dispositivo. Mi espacio guarda etapa, notas y
                una lista de pasos con tu usuario. Gratis hasta 3 promociones; PRO quita el límite y añade avisos por
                SMS.
              </p>
              <div className="mt-6">
                <ButtonLink href="/pro#pagar" variant="secondary" className="w-full sm:w-auto">
                  Ver qué incluye PRO
                </ButtonLink>
              </div>
            </div>
            {samplePromotion ? <SpaceDemo promotion={samplePromotion} /> : null}
          </div>
        </section>

        <section className="lp-section">
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
