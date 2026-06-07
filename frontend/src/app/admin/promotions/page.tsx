'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { api } from '@/lib/api';
import type { BackofficeOverview, PromotionDetail } from '@/types';

const statuses = ['published_unreviewed', 'published_reviewed'] as const;
const statusLabels: Record<(typeof statuses)[number], string> = {
  published_unreviewed: 'Publicada sin revisar',
  published_reviewed: 'Publicada revisada',
};

function promotionTimestamp(promotion: PromotionDetail) {
  return new Date(promotion.createdAt || promotion.publishedAt || promotion.alertDetectedAt || 0).getTime();
}

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionDetail[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [overview, setOverview] = useState<BackofficeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [rows, reviewedRows, overviewData] = await Promise.all([
          api.getBackofficePromotions(status || 'published_unreviewed', query || undefined, 10),
          status ? Promise.resolve([]) : api.getBackofficePromotions('published_reviewed', query || undefined, 10),
          api.getBackofficeOverview().catch(() => null),
        ]);
        if (!active) return;
        setPromotions(
          [...rows, ...reviewedRows]
            .sort((a, b) => promotionTimestamp(b) - promotionTimestamp(a))
            .slice(0, 10),
        );
        setOverview(overviewData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar promociones');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [status, query]);

  const filtered = useMemo(() => {
    return promotions;
  }, [promotions]);
  const statusCounts = {
    published_unreviewed: overview?.publishedUnreviewed ?? promotions.filter((promotion) => promotion.status === 'published_unreviewed').length,
    published_reviewed: overview?.publishedReviewed ?? promotions.filter((promotion) => promotion.status === 'published_reviewed').length,
  };

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="CMS de promociones"
            title="10 promociones publicadas para gestionar hoy"
            description="Solo aparecen las 10 promociones publicadas más recientes. El resto vive en Histórico y los avisos pendientes se gestionan en Avisos."
            actions={
              <>
                <ButtonLink href="/admin/promotions/history" variant="secondary">Ver histórico</ButtonLink>
                <ButtonLink href="/admin/alerts" variant="secondary">Gestionar avisos</ButtonLink>
              </>
            }
          />

          <section className="grid gap-3 md:grid-cols-2">
            {statuses.map((item) => (
              <SurfaceCard key={item} className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{statusLabels[item]}</p>
                <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">
                  {statusCounts[item]}
                </p>
              </SurfaceCard>
            ))}
          </section>

          <section className="rounded-[1.5rem] border border-[var(--stroke)] bg-white p-4 shadow-card">
            <SectionHeader
              eyebrow="Flujo de edición"
              title="Promociones"
              description="Base preparada para editor visual, multimedia, historial y programación de publicación."
            />
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_260px]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por título, municipio, promotor o texto"
                className="ds-control"
              />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="ds-control">
                <option value="">Publicadas sin revisar + revisadas</option>
                {statuses.map((item) => (
                  <option key={item} value={item}>{statusLabels[item]}</option>
                ))}
              </select>
            </div>
          </section>

          {error ? <SurfaceCard className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</SurfaceCard> : null}
          {loading ? <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Cargando promociones...</SurfaceCard> : null}

          {!loading && filtered.length === 0 ? (
            <SurfaceCard className="p-6 text-center">
              <h2 className="display-type text-2xl font-black text-[var(--ink)]">No hay promociones con estos criterios</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">Prueba a limpiar la búsqueda o revisa el histórico.</p>
            </SurfaceCard>
          ) : null}

          <Stagger className="grid gap-4 lg:grid-cols-2">
            {filtered.map((promotion) => (
              <StaggerItem key={promotion.id}>
                <MotionCard className="ds-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{statusLabels[promotion.status as (typeof statuses)[number]] || promotion.status}</p>
                      <h2 className="display-type mt-2 text-2xl font-black text-[var(--ink)]">{promotion.title}</h2>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'} · {promotion.promotionType}</p>
                    </div>
                    <Link href={`/admin/promotions/${promotion.id}`} className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--green-900)]">
                      Editar ficha
                    </Link>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">Docs {promotion.documents?.length || 0}</span>
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">Unidades {promotion.units?.length || 0}</span>
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">{promotion.requirements ? 'Requisitos OK' : 'Sin requisitos'}</span>
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">{promotion.publicDescription ? 'Descripción OK' : 'Sin descripción'}</span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    <Link href={`/admin/promotions/${promotion.id}`} className="rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-center text-xs font-bold text-[var(--ink)] hover:bg-[var(--bg-eco)]">Contenido</Link>
                    <Link href={`/admin/promotions/${promotion.id}#documentos`} className="rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-center text-xs font-bold text-[var(--ink)] hover:bg-[var(--bg-eco)]">Multimedia</Link>
                    <Link href={`/admin/promotions/${promotion.id}#unidades`} className="rounded-2xl border border-[var(--stroke)] bg-white px-3 py-2 text-center text-xs font-bold text-[var(--ink)] hover:bg-[var(--bg-eco)]">Viviendas</Link>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </main>
  );
}
