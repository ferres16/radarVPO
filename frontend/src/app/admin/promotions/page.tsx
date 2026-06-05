'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { api } from '@/lib/api';
import type { PromotionDetail } from '@/types';

const statuses = ['pending_review', 'published_unreviewed', 'published_reviewed', 'archived'] as const;

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<PromotionDetail[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.getBackofficePromotions(status || undefined);
        if (!active) return;
        setPromotions(rows);
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
  }, [status]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return promotions;
    return promotions.filter((promotion) =>
      `${promotion.title} ${promotion.municipality || ''} ${promotion.province || ''}`.toLowerCase().includes(term),
    );
  }, [promotions, query]);

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="CMS de promociones"
            title="Gestión editorial de promociones publicadas"
            description="Revisa estados, completa fichas, gestiona documentos, unidades, requisitos y publicación desde una vista operativa."
            actions={<ButtonLink href="/admin">Volver al dashboard</ButtonLink>}
          />

          <section className="grid gap-3 md:grid-cols-4">
            {statuses.map((item) => (
              <SurfaceCard key={item} className="p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{item.replace(/_/g, ' ')}</p>
                <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">
                  {promotions.filter((promotion) => promotion.status === item).length}
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
                placeholder="Buscar por título o municipio"
                className="ds-control"
              />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="ds-control">
                <option value="">Todos los estados</option>
                {statuses.map((item) => (
                  <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </section>

          {error ? <SurfaceCard className="border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">{error}</SurfaceCard> : null}
          {loading ? <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Cargando promociones...</SurfaceCard> : null}

          <Stagger className="grid gap-4 lg:grid-cols-2">
            {filtered.map((promotion) => (
              <StaggerItem key={promotion.id}>
                <MotionCard className="ds-card p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">{promotion.status.replace(/_/g, ' ')}</p>
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
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">Requisitos</span>
                    <span className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs font-semibold text-[var(--ink-soft)]">Historial</span>
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
