import { Fragment } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { InlineAdCard } from '@/components/ads';
import { PromotionCard } from '@/components/promotion-card';
import { ProComparison } from '@/components/pro-comparison';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
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
    <main className="shell space-y-6 pb-10">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.publishedPromotions, path: '/promotions' },
        ])}
      />
      <PageHero
        eyebrow={copy.publishedPromotions}
        title="Promociones ya abiertas con plazos y requisitos"
        description={copy.publishedPromotionsDesc}
        actions={
          <>
            <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/alerts" variant="secondary">Ver próximos lanzamientos</ButtonLink>
          </>
        }
      />

      <SurfaceCard premium className="flex flex-col gap-4 bg-[var(--bg-eco)]/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">{proPlan.name}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">¿No quieres revisar esta página cada día?</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Recibe notificaciones cuando detectemos promociones relevantes. {proPlan.price}</p>
        </div>
        <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
      </SurfaceCard>

      <SurfaceCard premium className="p-4">
        <form className="grid gap-3 md:grid-cols-[1fr_auto]" action="/promotions" method="get" aria-label="Buscar promociones publicadas">
          <label className="text-sm font-semibold text-[var(--ink)]">
            Buscar por palabras clave
            <input name="q" defaultValue={q} placeholder="Ej: Barcelona alquiler cooperativa..." className="ds-control mt-1 w-full" />
          </label>
          <div className="flex items-end gap-2">
            <button className="w-full rounded-2xl bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white shadow-glow transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-900)] md:w-auto">
              Buscar
            </button>
          </div>
        </form>
      </SurfaceCard>

      <section className="section-band section-band--muted flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[var(--ink)]">{visiblePromotions.length} promociones publicadas</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">{q ? 'Resultados filtrados por búsqueda.' : 'Últimas 10 oportunidades activas.'}</p>
        </div>
        <Link href="/promotions" className="inline-flex rounded-full border border-[var(--stroke-strong)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
          Limpiar filtros
        </Link>
      </section>

      {visiblePromotions.length === 0 ? (
        <SurfaceCard premium className="p-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--green-700)]">Sin oportunidades disponibles</p>
          <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">No hay promociones publicadas ahora mismo</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Puedes consultar próximos lanzamientos o activar VPO PRO para recibir notificaciones cuando aparezcan nuevas oportunidades.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/alerts" variant="secondary">Ver próximos lanzamientos</ButtonLink>
          </div>
        </SurfaceCard>
      ) : (
        <section className="space-y-4">
          <SectionHeader title="Últimas promociones publicadas" description="Fichas recientes con ubicación, estado y acceso al detalle." />
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Promociones publicadas">
            {visiblePromotions.map((promotion, index) => (
              <Fragment key={promotion.id}>
                {index === 3 ? <InlineAdCard className="md:col-span-2 xl:col-span-3" /> : null}
                <PromotionCard promotion={promotion} />
              </Fragment>
            ))}
          </section>
        </section>
      )}

      <ProComparison
        title="No revises esta página cada día"
        description="Con VPO PRO recibes notificaciones cuando detectamos promociones relevantes o próximos lanzamientos en tu zona."
      />
    </main>
  );
}
