import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { InlineAdCard } from '@/components/ads';
import { AlertsProCtaBand } from '@/components/conversion/alerts-pro-cta-band';
import { PromotionsExplorer } from '@/components/conversion/promotions-explorer';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { publicPublishedPromotions } from '@/lib/public-promotions';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const revalidate = 30;

export const metadata: Metadata = createMetadata({
  title: 'Promociones publicadas de vivienda protegida en Cataluña',
  description:
    'Consulta gratis las promociones de vivienda protegida publicadas en Cataluña y lee sus bases y documentos oficiales sin salir de la web.',
  path: '/promotions',
  keywords: ['promociones publicadas VPO', 'vivienda pública cataluña', 'pisos protegidos cataluña'],
});

export default async function PromotionsPage() {
  const promotions = await api.getPromotions('?limit=40').catch(() => []);
  const visiblePromotions = publicPublishedPromotions(promotions, 24);

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
        description="Abre las bases y anexos oficiales de cada promoción sin salir de Radar VPO. Es gratis y no necesitas cuenta."
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
            description={`${visiblePromotions.length} promociones publicadas. Filtra por municipio si quieres acotar la lista.`}
          />
          <PromotionsExplorer promotions={visiblePromotions} />
          <p className="mt-6 text-sm text-[var(--ink-soft)]">
            ¿Aún no está publicada?{' '}
            <ButtonLink href="/alerts" variant="secondary">
              Ver próximos lanzamientos
            </ButtonLink>
          </p>
          <InlineAdCard className="mt-6" />
        </PublicSection>
      )}

      <PublicSection animated={false} muted border>
        <AlertsProCtaBand
          title="Recibe un aviso cuando se publique la siguiente"
          description="Consultar las promociones y sus documentos oficiales es gratis. Con Radar VPO PRO recibes avisos por email y SMS de nuevas promociones."
          ctaLabel="Ver Radar VPO PRO"
        />
      </PublicSection>
    </PublicPage>
  );
}
