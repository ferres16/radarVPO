import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { InlineAdCard } from '@/components/ads';
import { AlertsProCtaBand } from '@/components/conversion/alerts-pro-cta-band';
import { PromotionsExplorer } from '@/components/conversion/promotions-explorer';
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
    'Consulta promociones de vivienda protegida publicadas en Cataluña. Sin cuenta ves un adelanto; con email verificado abres todas las bases oficiales.',
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
        description="Sin cuenta ves hasta 10 en listado y el detalle completo de las 2 últimas. Crea una cuenta gratuita y verifica el email para abrir el resto."
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
              visiblePromotions.length === 1 ? 'promoción visible' : 'promociones visibles'
            } en este listado. Sin cuenta verificada el servidor limita el listado y el detalle completo.`}
          />
          <PromotionsExplorer promotions={visiblePromotions} />
          <div className="mt-6 rounded-2xl border border-[var(--stroke)] bg-white p-4 text-sm leading-6 text-[var(--ink-soft)]">
            <p className="font-semibold text-[var(--ink)]">¿Quieres ver todas las publicaciones?</p>
            <p className="mt-1">
              Crea una cuenta gratuita y verifica tu email. Así desbloqueas el listado completo y los PDF
              de todas las promociones publicadas.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/register?next=%2Fpromotions">Crear cuenta gratuita</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary">
                Ver próximos lanzamientos
              </ButtonLink>
            </div>
          </div>
          <InlineAdCard className="mt-6" />
        </PublicSection>
      )}

      <PublicSection animated={false} muted border>
        <AlertsProCtaBand
          title="Recibe un aviso cuando se publique la siguiente"
          description="Con cuenta verificada abres todas las publicaciones. Con Radar VPO PRO (email verificado) recibes avisos por email y SMS."
          ctaLabel="Ver Radar VPO PRO"
        />
      </PublicSection>
    </PublicPage>
  );
}
