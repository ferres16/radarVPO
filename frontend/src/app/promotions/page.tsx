import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { PromotionCard } from '@/components/promotion-card';
import { PublicPage, PublicPageHero, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { HorizontalRail, HorizontalRailItem } from '@/components/saas/horizontal-rail';
import { FilterChips } from '@/components/saas/filter-chips';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Promociones publicadas de vivienda protegida en Cataluña',
  description:
    'Consulta promociones ya abiertas o publicadas oficialmente con requisitos, plazos y documentación en Cataluña.',
  path: '/promotions',
  keywords: ['promociones publicadas VPO', 'vivienda pública cataluña', 'pisos protegidos cataluña'],
});

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = typeof sp.q === 'string' ? sp.q : '';

  const query = new URLSearchParams();
  if (q) query.set('q', q);
  query.set('limit', '10');

  const promotions = await api.getPromotions(`?${query.toString()}`).catch(() => []);
  const visiblePromotions = promotions.filter((item) => item.status !== 'archived');

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.publishedPromotions, path: '/promotions' },
        ])}
      />

      <PublicPageHero
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

      <PublicProBanner title="¿No quieres revisar esta página cada día?" className="hidden md:block" />

      <PublicSection>
        <SurfaceCard className="space-y-4 p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/promotions" method="get" aria-label="Buscar promociones publicadas">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Buscar por palabras clave
              <input name="q" defaultValue={q} placeholder="Ej: Barcelona, cooperativa..." className="ds-control mt-2 min-h-11 w-full" />
            </label>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn--primary btn--lg min-h-11 w-full md:w-auto">
                Buscar
              </button>
            </div>
          </form>
          <FilterChips
            chips={[
              { label: 'Todas', href: '/promotions', active: !q },
              { label: 'Barcelona', href: '/promotions?q=barcelona', active: q.toLowerCase() === 'barcelona' },
              { label: 'Cooperativa', href: '/promotions?q=cooperativa', active: q.toLowerCase() === 'cooperativa' },
              { label: 'Alquiler', href: '/promotions?q=alquiler', active: q.toLowerCase() === 'alquiler' },
            ]}
          />
        </SurfaceCard>

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-[var(--stroke)] bg-[#f8faf9] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{visiblePromotions.length} promociones publicadas</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{q ? 'Resultados filtrados por búsqueda.' : 'Últimas oportunidades activas.'}</p>
          </div>
          <Link href="/promotions" className="btn btn--secondary min-h-11">
            Limpiar filtros
          </Link>
        </div>
      </PublicSection>

      {visiblePromotions.length === 0 ? (
        <PublicSection>
          <div className="empty-illus">
            <span className="empty-illus__icon" aria-hidden="true">◎</span>
            <h2 className="lp-title mt-4 text-xl">No hay promociones publicadas ahora mismo</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
              Consulta próximos lanzamientos o activa VPO PRO para recibir notificaciones.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary" size="lg">Ver próximos lanzamientos</ButtonLink>
            </div>
          </div>
        </PublicSection>
      ) : (
        <PublicSection>
          <SectionHeader title="Últimas promociones" description="Listado actualizado con las promociones activas en Cataluña." />
          <div className="mt-4 grid gap-4 md:hidden">
            {visiblePromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} layout="grid" />
            ))}
          </div>
          <div className="mt-4 hidden md:mt-6 md:block">
            <HorizontalRail columns={3}>
              {visiblePromotions.map((promotion) => (
                <HorizontalRailItem key={promotion.id}>
                  <PromotionCard promotion={promotion} layout="rail" />
                </HorizontalRailItem>
              ))}
            </HorizontalRail>
          </div>
        </PublicSection>
      )}

      <PublicSection muted border>
        <SectionHeader
          title="No revises esta página cada día"
          description="Con VPO PRO recibes notificaciones cuando detectamos promociones relevantes o próximos lanzamientos en tu zona."
        />
        <div className="mt-4">
          <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
        </div>
      </PublicSection>
    </PublicPage>
  );
}
