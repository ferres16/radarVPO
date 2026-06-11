import { Fragment } from 'react';
import { api } from '@/lib/api';
import { InlineAdCard } from '@/components/ads';
import { EmptyState } from '@/components/empty-state';
import { NewsCard } from '@/components/news-card';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { Stagger, StaggerItem } from '@/components/motion-primitives';

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
    <main className="shell space-y-6 pb-10">
      <PageHero
        eyebrow="Noticias"
        title="Actualidad útil para tomar mejores decisiones"
        description="Una página editorial para entender cambios normativos, convocatorias, ayudas y oportunidades de vivienda pública sin ruido burocrático."
        actions={<ButtonLink href="/promotions">Ver promociones</ButtonLink>}
      />

      <SurfaceCard className="p-4">
        <form action="/news" method="get" role="search" aria-label="Buscar noticias">
          <label className="text-sm font-semibold text-[var(--ink)]">
            Buscar noticias
            <input name="q" defaultValue={q} className="ds-control mt-2 w-full" placeholder="Ayudas, alquiler, requisitos..." />
          </label>
        </form>
      </SurfaceCard>

      {filtered.length === 0 ? (
        <EmptyState title="Sin noticias publicadas" description="Aún no hay noticias disponibles." />
      ) : (
        <>
          {featured ? (
            <SurfaceCard className="overflow-hidden">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="min-h-56 bg-[linear-gradient(135deg,rgba(22,112,85,0.18),rgba(54,189,248,0.16),rgba(244,197,66,0.18))] p-5">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Destacada</span>
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">{featured.category || featured.topic || featured.relevance}</p>
                  <h2 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">{featured.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{featured.summary || 'Sin resumen disponible.'}</p>
                  <p className="mt-3 text-xs font-semibold text-[var(--ink-soft)]">{featured.publishedAt.slice(0, 10)} · 3 min lectura</p>
                  <div className="mt-5">
                    <ButtonLink href={`/news/${featured.id}`}>Leer noticia</ButtonLink>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          <section className="space-y-4">
            <SectionHeader eyebrow="Recientes" title="Últimas publicaciones" />
            <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recent.map((item, index) => (
                <Fragment key={item.id}>
                  {index === 3 ? <InlineAdCard className="md:col-span-2 xl:col-span-3" /> : null}
                  <StaggerItem>
                    <NewsCard item={item} />
                  </StaggerItem>
                </Fragment>
              ))}
            </Stagger>
          </section>
        </>
      )}
    </main>
  );
}
