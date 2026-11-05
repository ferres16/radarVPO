import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ButtonLink } from '@/components/design-system';
import { FeaturedCourseSpotlight } from '@/components/conversion/featured-course-spotlight';
import { HomeFaq } from '@/components/conversion/home-faq';
import { HomeFinalCtaBand, HomeHeroActions } from '@/components/conversion/home-pro-ctas';
import { HomeOfferStrip } from '@/components/conversion/home-offer-strip';
import { RegisterButton, RegisterPromo } from '@/components/conversion/register-promo';
import { PromotionCard } from '@/components/promotion-card';
import { TrackedButtonLink } from '@/components/tracked-link';
import { StructuredData } from '@/components/structured-data';
import { homeFaqs } from '@/lib/conversion';
import { formatEuro, getCoursePrice, isCourseSellable, isIncludedInPro } from '@/lib/offer';
import { getGuideReadHref, getOwnedCourseSlugs } from '@/lib/owned-courses';
import { pickFeaturedPublicCourse, publicCatalogCourses } from '@/lib/public-courses';
import { publicPublishedPromotions } from '@/lib/public-promotions';
import { proPlan } from '@/lib/pro';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createMetadata({
  title: 'Consulta promociones de vivienda protegida en Cataluña',
  description:
    'Consulta promociones de vivienda protegida con su documento oficial, entiende el proceso con una guía y recibe alertas con Radar VPO PRO.',
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
  const [courses, promotions, ownedSlugs] = await Promise.all([
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=100').catch(() => []),
    getOwnedCourseSlugs(),
  ]);
  const featuredCourse = pickFeaturedPublicCourse(courses);
  const featuredOwned = Boolean(featuredCourse && ownedSlugs.has(featuredCourse.slug));
  const featuredSellable = featuredCourse ? isCourseSellable(featuredCourse) : false;
  const featuredPrice = featuredCourse ? getCoursePrice(featuredCourse) : null;
  const featuredHref = featuredCourse
    ? featuredOwned
      ? getGuideReadHref(featuredCourse.slug)
      : `/cursos/${featuredCourse.slug}#pagar`
    : '/cursos/guiav1#pagar';
  const featuredCta = featuredOwned
    ? 'Abrir la guía'
    : featuredSellable && featuredPrice !== null
      ? `Comprar la guía · ${formatEuro(featuredPrice)}`
      : 'Comprar la guía';
  const listed = publicPublishedPromotions(promotions);
  const previewPromotions = listed.slice(0, 3);
  const includedProGuideTitles = publicCatalogCourses(courses)
    .filter(isIncludedInPro)
    .map((course) => course.title);

  return (
    <>
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd([...homeFaqs])]} />

      <main className="lp lp--app">
        <section className="lp-hero" aria-labelledby="hero-title">
          <div className="lp-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="lp-hero__split lp-hero__split--product">
              <div className="lp-hero__inner">
                <span className="lp-hero__badge">Radar VPO · Cataluña</span>
                <h1 id="hero-title" className="lp-hero__title">
                  La vivienda protegida en Cataluña, más fácil de entender y seguir.
                </h1>
                <p className="lp-hero__subtitle">
                  {featuredOwned
                    ? 'Ya tienes la guía en tu cuenta. Consultar promociones y documentos oficiales sigue siendo gratis.'
                    : 'Regístrate gratis para ver todas las promociones que han salido y las fechas aproximadas de los próximos lanzamientos. Con Radar VPO PRO te avisamos en cuanto se publica una.'}
                </p>
                <HomeHeroActions guideHref={featuredHref} guideCta={featuredCta} />
              </div>
              <figure className="lp-product-shot">
                <Link href="/pro" aria-label="Ver Radar VPO PRO">
                  <Image
                    src={proPlan.productImageSrc}
                    alt={proPlan.productImageAlt}
                    width={1024}
                    height={1536}
                    priority
                    className="lp-product-shot__image"
                    sizes="(max-width: 768px) 100vw, 380px"
                  />
                </Link>
                <figcaption className="lp-product-shot__caption">
                  Radar VPO PRO · Alertas · WhatsApp · {proPlan.priceShort}/mes
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="lp-section lp-section--border" aria-labelledby="offer-title">
          <div className="shell">
            <div className="lp-section__head">
              <p className="lp-eyebrow">Qué puedes hacer</p>
              <h2 id="offer-title" className="lp-title">
                Empieza gratis y da el siguiente paso cuando lo necesites
              </h2>
            </div>
            <HomeOfferStrip
              guide={
                featuredOwned && featuredCourse
                  ? {
                      href: featuredHref,
                      price: 'Ya tuya',
                      cta: featuredCta,
                    }
                  : featuredSellable && featuredPrice !== null
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
                <p className="lp-eyebrow">Promociones</p>
                <h2 id="promos-title" className="lp-title">
                  Promociones publicadas, con su documento oficial
                </h2>
                <p className="lp-lead">
                  Las últimas convocatorias con su PDF oficial. Regístrate gratis para ver todas las que han
                  salido y no perderte ninguna.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {previewPromotions.map((promotion) => (
                  <PromotionCard key={promotion.id} promotion={promotion} layout="grid" animated={false} />
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <RegisterButton next="/promotions" source="home_promos" size="md">
                  Regístrate gratis y ver todas
                </RegisterButton>
                <ButtonLink href="/promotions" variant="secondary" className="w-full sm:w-auto">
                  Ver promociones
                </ButtonLink>
              </div>
              <RegisterPromo reason="dates" next="/alerts" className="mt-8" />
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
                  {featuredOwned
                    ? 'Ya está en tu cuenta. Entra a leerla, sin volver a pagar.'
                    : 'Lectura en pantalla, pago único y acceso mínimo de 24 meses. Registro, papeles y pasos hasta la firma.'}
                </p>
              </div>
              <FeaturedCourseSpotlight course={featuredCourse} owned={featuredOwned} />
            </div>
          </section>
        ) : null}

        <section className="lp-section lp-section--muted lp-section--border" aria-labelledby="pro-title">
          <div className="shell lp-hero__split">
            <div>
              <p className="lp-eyebrow">Radar VPO PRO</p>
              <h2 id="pro-title" className="lp-title">
                Alertas a tiempo y WhatsApp para consultas
              </h2>
              <p className="lp-lead">
                Te avisamos por email y SMS cuando detectamos una promoción. Con PRO también tienes WhatsApp para
                resolver dudas del proceso mientras la suscripción esté activa.
              </p>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--ink)]">
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
                  <span>Avisos por email y SMS</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
                  <span>WhatsApp para consultas (no presentamos la solicitud por ti)</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
                  <span>{proPlan.priceShort}/mes · cancelas cuando quieras</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <TrackedButtonLink
                  href="/pro#pagar"
                  size="lg"
                  event="pro_cta_clicked"
                  eventProperties={{ source: 'home_whatsapp_promo' }}
                >
                  {`Empezar PRO · ${proPlan.priceShort}/mes`}
                </TrackedButtonLink>
                <ButtonLink href="/pro" variant="secondary" size="lg">
                  Ver ficha PRO
                </ButtonLink>
              </div>
            </div>
            <aside className="lp-whatsapp-card" aria-label="Acceso a WhatsApp">
              <p className="lp-whatsapp-card__kicker">Incluido en PRO</p>
              <p className="lp-whatsapp-card__title">Acceso a WhatsApp</p>
              <p className="lp-whatsapp-card__text">para consultas</p>
              <p className="lp-whatsapp-card__note">
                Canal directo para dudas del proceso y las promociones. Disponible mientras tu suscripción esté activa.
              </p>
            </aside>
          </div>
        </section>

        <section className="lp-section">
          <div className="shell">
            <HomeFaq />
          </div>
        </section>

        <section className="lp-section lp-section--muted">
          <div className="shell">
            <HomeFinalCtaBand includedGuideTitles={includedProGuideTitles} />
          </div>
        </section>
      </main>
    </>
  );
}
