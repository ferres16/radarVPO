import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { InlineAdCard } from '@/components/ads';
import { AlertsProCtaBand } from '@/components/conversion/alerts-pro-cta-band';
import { PromotionsExplorer } from '@/components/conversion/promotions-explorer';
import { RegisterButton, RegisterPromo } from '@/components/conversion/register-promo';
import { ProofStats } from '@/components/conversion/proof-stats';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { buildProofItems } from '@/lib/catalog-stats';
import { publicPublishedPromotions, uniqueMunicipalities } from '@/lib/public-promotions';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const revalidate = 30;

export const metadata: Metadata = createMetadata({
  title: 'Promociones publicadas de vivienda protegida en Cataluña',
  description:
    'Consulta las promociones de vivienda protegida publicadas en Cataluña con su documento oficial. Regístrate gratis para ver todas las convocatorias.',
  path: '/promotions',
  keywords: ['promociones publicadas VPO', 'vivienda pública cataluña', 'pisos protegidos cataluña'],
});

export default async function PromotionsPage() {
  const [promotions, stats] = await Promise.all([
    api.getPromotions('?limit=100').catch(() => []),
    api.getCatalogStats().catch(() => null),
  ]);
  const listed = publicPublishedPromotions(promotions);
  const visiblePromotions = listed;
  const hasLockedContent = listed.some((promotion) => promotion.detailLocked);
  const proofItems = buildProofItems(stats, {
    published: listed.length,
    municipalities: uniqueMunicipalities(listed).length,
  });

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.publishedPromotions, path: '/promotions' },
        ])}
      />

      <PublicPageHero
        animated={false}
        badge={copy.publishedPromotions}
        title="Promociones publicadas"
        titleAccent="con su documento oficial"
        description="Todas las convocatorias de vivienda protegida publicadas en Cataluña, con su PDF oficial. Regístrate gratis para ver todas las que han salido, no solo las últimas."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <RegisterButton next="/promotions" source="promotions_hero" block>
              Regístrate gratis y ver todas
            </RegisterButton>
            <ButtonLink href="/pro" size="lg" variant="secondary" block>
              Avisos al momento con PRO
            </ButtonLink>
          </div>
        }
        footer={<ProofStats items={proofItems} />}
      />

      {visiblePromotions.length === 0 ? (
        <PublicSection animated={false}>
          <div className="empty-illus">
            <span className="empty-illus__icon" aria-hidden="true">
              ○
            </span>
            <h2 className="lp-title mt-4 text-xl">No hay promociones publicadas ahora mismo</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
              Consulta próximos lanzamientos mientras se publican nuevas convocatorias.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/alerts" size="lg">
                Ver próximos lanzamientos
              </ButtonLink>
            </div>
          </div>
        </PublicSection>
      ) : (
        <PublicSection animated={false}>
          <SectionHeader
            title="Últimas promociones"
            description={`${visiblePromotions.length} ${
              visiblePromotions.length === 1 ? 'promoción' : 'promociones'
            } con su documento oficial.`}
          />
          {hasLockedContent ? (
            <RegisterPromo reason="promotions" next="/promotions" compact className="mb-6" />
          ) : null}
          <PromotionsExplorer promotions={visiblePromotions} />
          {hasLockedContent ? (
            <RegisterPromo reason="promotions" next="/promotions" className="mt-8" />
          ) : null}
          <InlineAdCard className="mt-6" />
        </PublicSection>
      )}

      <PublicSection animated={false} muted border>
        <AlertsProCtaBand
          title="Recibe un aviso cuando se publique la siguiente"
          description="Con tu cuenta gratuita consultas todas las promociones. Con Radar VPO PRO te avisamos por email y SMS en cuanto sale una nueva, para que no se te pase ningún plazo."
          ctaLabel="Ver Radar VPO PRO"
        />
      </PublicSection>
    </PublicPage>
  );
}
