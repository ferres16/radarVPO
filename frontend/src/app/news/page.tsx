import { Fragment } from 'react';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { InlineAdCard } from '@/components/ads';
import { EmptyState } from '@/components/empty-state';
import { NewsCard } from '@/components/news-card';
import { PublicPage, PublicSection } from '@/components/conversion/public-shell';
import { PublicInlineProCta } from '@/components/conversion/public-pro-actions';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Noticias de vivienda pública en Cataluña',
  description:
    'Actualidad sobre vivienda pública y protegida en Cataluña: ayudas, normativa, adjudicaciones y promociones VPO/HPO.',
  path: '/news',
  keywords: ['vivienda pública cataluña', 'vivienda publica catalunya', 'noticias vivienda pública', 'vivienda social cataluña'],
});

export default async function NewsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const q = typeof sp.q === 'string' ? sp.q : '';
  const news = await api.getNews().catch(() => []);
  const filtered = news.filter((item) => {
    if (!q) return true;
    return `${item.title} ${item.summary || ''} ${item.topic || ''} ${item.category || ''}`.toLowerCase().includes(q.toLowerCase());
  });
  const featured = filtered[0];
  const recent = filtered.slice(featured ? 1 : 0);

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: 'Noticias', path: '/news' },
        ])}
      />

      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell lp-page-hero__inner">
          <span className="lp-hero__badge">Noticias</span>
          <h1 className="lp-page-hero__title">
            Actualidad útil
            <span className="lp-hero__title-accent"> para tomar mejores decisiones</span>
          </h1>
          <p className="lp-page-hero__subtitle">
            Cambios normativos, convocatorias, ayudas y oportunidades de vivienda pública sin ruido burocrático.
          </p>
          <div className="lp-hero__actions">
            <ButtonLink href="/promotions" size="lg">Ver promociones</ButtonLink>
            <PublicInlineProCta />
          </div>
        </div>
      </section>

      <PublicSection>
        <SurfaceCard className="p-4">
          <form action="/news" method="get" role="search" aria-label="Buscar noticias">
            <label className="text-sm font-semibold text-[var(--ink)]">
              Buscar noticias
              <input name="q" defaultValue={q} className="ds-control mt-2 w-full" placeholder="Ayudas, alquiler, requisitos..." />
            </label>
          </form>
        </SurfaceCard>
      </PublicSection>

      {filtered.length === 0 ? (
        <PublicSection>
          <EmptyState title="Sin noticias publicadas" description="Aún no hay noticias disponibles." />
        </PublicSection>
      ) : (
        <>
          {featured ? (
            <PublicSection muted>
              <SurfaceCard premium className="overflow-hidden">
                <div className="grid lg:grid-cols-[0.35fr_1fr]">
                  <div className="min-h-40 bg-[#f3faf7] p-5">
                    <span className="lp-hero__badge">Destacada</span>
                  </div>
                  <div className="p-5 md:p-6">
                    <p className="lp-eyebrow">{featured.category || featured.topic || featured.relevance}</p>
                    <h2 className="lp-title mt-3">{featured.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{featured.summary || 'Sin resumen disponible.'}</p>
                    <p className="mt-3 text-xs text-[var(--ink-soft)]">{featured.publishedAt.slice(0, 10)} · 3 min lectura</p>
                    <div className="mt-5">
                      <ButtonLink href={`/news/${featured.id}`}>Leer noticia</ButtonLink>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            </PublicSection>
          ) : null}

          <PublicSection border={Boolean(featured)}>
            <SectionHeader eyebrow="Recientes" title="Últimas publicaciones" />
            <Stagger className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2 xl:grid-cols-3">
              {recent.map((item, index) => (
                <Fragment key={item.id}>
                  {index === 3 ? <InlineAdCard className="md:col-span-2 xl:col-span-3" /> : null}
                  <StaggerItem>
                    <NewsCard item={item} />
                  </StaggerItem>
                </Fragment>
              ))}
            </Stagger>
          </PublicSection>
        </>
      )}
    </PublicPage>
  );
}
