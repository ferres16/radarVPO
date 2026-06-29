import { Fragment } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { InlineAdCard } from '@/components/ads';
import { PromotionCard } from '@/components/promotion-card';
import { PublicPage, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { ProComparison } from '@/components/pro-comparison';
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

      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell lp-page-hero__inner">
          <span className="lp-hero__badge">{copy.publishedPromotions}</span>
          <h1 className="lp-page-hero__title">
            Promociones ya abiertas
            <span className="lp-hero__title-accent"> con plazos y requisitos</span>
          </h1>
          <p className="lp-page-hero__subtitle">{copy.publishedPromotionsDesc}</p>
          <div className="lp-hero__actions">
            <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/alerts" variant="secondary" size="lg">Ver próximos lanzamientos</ButtonLink>
          </div>
        </div>
      </section>

      <PublicProBanner title="¿No quieres revisar esta página cada día?" />

      <PublicSection>
        <SurfaceCard className="p-4">
          <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/promotions" method="get" aria-label="Buscar promociones publicadas">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Buscar por palabras clave
              <input name="q" defaultValue={q} placeholder="Ej: Barcelona, cooperativa..." className="ds-control mt-1 w-full" />
            </label>
            <div className="flex items-end gap-2">
              <button type="submit" className="btn btn--primary btn--lg w-full md:w-auto">
                Buscar
              </button>
            </div>
          </form>
        </SurfaceCard>

        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[var(--stroke)] bg-[#f8faf9] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--ink)]">{visiblePromotions.length} promociones publicadas</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{q ? 'Resultados filtrados por búsqueda.' : 'Últimas 10 oportunidades activas.'}</p>
          </div>
          <Link href="/promotions" className="btn btn--secondary">
            Limpiar filtros
          </Link>
        </div>
      </PublicSection>

      {visiblePromotions.length === 0 ? (
        <PublicSection>
          <SurfaceCard premium className="p-8 text-center">
            <p className="lp-eyebrow">Sin oportunidades disponibles</p>
            <h2 className="lp-title mt-3">No hay promociones publicadas ahora mismo</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Consulta próximos lanzamientos o activa VPO PRO para recibir notificaciones.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary" size="lg">Ver próximos lanzamientos</ButtonLink>
            </div>
          </SurfaceCard>
        </PublicSection>
      ) : (
        <PublicSection>
          <SectionHeader title="Últimas promociones publicadas" description="Fichas recientes con ubicación, estado y acceso al detalle." />
          <Stagger className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Promociones publicadas">
            {visiblePromotions.map((promotion, index) => (
              <Fragment key={promotion.id}>
                {index === 3 ? <InlineAdCard className="md:col-span-2 xl:col-span-3" /> : null}
                <StaggerItem>
                  <PromotionCard promotion={promotion} />
                </StaggerItem>
              </Fragment>
            ))}
          </Stagger>
        </PublicSection>
      )}

      <PublicSection muted border>
        <ProComparison
          title="No revises esta página cada día"
          description="Con VPO PRO recibes notificaciones cuando detectamos promociones relevantes o próximos lanzamientos en tu zona."
        />
      </PublicSection>
    </PublicPage>
  );
}
