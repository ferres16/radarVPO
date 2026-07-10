import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { PromotionCard } from '@/components/promotion-card';
import { InlineAdCard } from '@/components/ads';
import { PublicPage, PublicPageHero, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { hasPublicFicha } from '@/lib/promotion-access';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Promociones publicadas de vivienda protegida en Cataluña',
  description:
    'Consulta promociones ya abiertas o publicadas oficialmente con requisitos, plazos y documentación en Cataluña.',
  path: '/promotions',
  keywords: ['promociones publicadas VPO', 'vivienda pública cataluña', 'pisos protegidos cataluña'],
});

export default async function PromotionsPage() {
  const promotions = await api.getPromotions('?limit=10').catch(() => []);
  const visiblePromotions = promotions.filter((item) => item.status !== 'archived' && hasPublicFicha(item));

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
        title="Promociones ya abiertas"
        titleAccent="con plazos y requisitos"
        description={copy.publishedPromotionsDesc}
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={proHref} size="lg" block>
              {proPlan.ctaLabel}
            </ButtonLink>
            <ButtonLink href="/alerts" variant="secondary" size="lg" block>
              Ver lanzamientos
            </ButtonLink>
          </div>
        }
      />

      <PublicProBanner animated={false} title="¿No quieres revisar esta página cada día?" className="hidden md:block" />

      {visiblePromotions.length === 0 ? (
        <PublicSection animated={false}>
          <div className="empty-illus">
            <span className="empty-illus__icon" aria-hidden="true">◎</span>
            <h2 className="lp-title mt-4 text-xl">No hay promociones publicadas ahora mismo</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
              Consulta próximos lanzamientos o activa VPO PRO para avisos por email y SMS, y el curso Guía VPO.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary" size="lg">Ver próximos lanzamientos</ButtonLink>
            </div>
          </div>
        </PublicSection>
      ) : (
        <PublicSection animated={false}>
          <SectionHeader
            title="Últimas promociones"
            description={`${visiblePromotions.length} promociones activas en Cataluña.`}
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visiblePromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} layout="grid" animated={false} />
            ))}
          </div>
          <InlineAdCard className="mt-6" />
        </PublicSection>
      )}

      <PublicSection animated={false} muted border>
        <SectionHeader
          title="No revises esta página cada día"
          description="Con VPO PRO recibes avisos por email y SMS, y acceso al curso Guía VPO."
        />
        <div className="mt-4">
          <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
        </div>
      </PublicSection>
    </PublicPage>
  );
}
