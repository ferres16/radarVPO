'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, MetricCard, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { api } from '@/lib/api';
import type { BackofficeOverview, PromotionDetail } from '@/types';

const STATUSES = ['pending_review', 'published_unreviewed', 'published_reviewed', 'archived'] as const;
const overviewLabels: Record<string, string> = {
  users: 'Usuarios',
  promotions: 'Promociones',
  pendingReview: 'Pendientes',
  publishedUnreviewed: 'Publicadas sin revisar',
  publishedReviewed: 'Publicadas revisadas',
  news: 'Noticias',
  jobsFailed: 'Fallos jobs',
};

export default function AdminPage() {
  const [overview, setOverview] = useState<BackofficeOverview | null>(null);
  const [promotions, setPromotions] = useState<PromotionDetail[]>([]);
  const [publicPromotionIds, setPublicPromotionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [nextOverview, nextPromotions, publicPromotions] = await Promise.all([
          api.getBackofficeOverview(),
          api.getBackofficePromotions(),
          api.getPromotions(),
        ]);
        if (!active) return;
        setOverview(nextOverview);
        setPromotions(nextPromotions);
        setPublicPromotionIds(new Set(publicPromotions.map((promotion) => promotion.id)));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar el panel de admin');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="shell">
        <article className="ds-card p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando panel de administracion...</p>
        </article>
      </main>
    );
  }

  if (error || !overview) {
    return (
      <main className="shell">
        <article className="ds-card p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Panel de administracion</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Gestión centralizada de promociones, usuarios y noticias.</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            Accede primero con una cuenta de administrador desde <Link href="/login" className="font-semibold text-[var(--green-700)]">iniciar sesion</Link>.
          </p>
        </article>
      </main>
    );
  }

  const grouped = {
    pending_review: promotions.filter((p) => p.status === 'pending_review'),
    published_unreviewed: promotions.filter(
      (p) => p.status === 'published_unreviewed' && publicPromotionIds.has(p.id),
    ),
    published_reviewed: promotions.filter((p) => p.status === 'published_reviewed'),
    archived: promotions.filter((p) => p.status === 'archived'),
  };

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="Panel de administración"
            title="Centro operativo para contenido, usuarios y promociones"
            description="Dashboard CMS con métricas, estados editoriales y accesos rápidos a cursos, servicios, promociones, noticias y activaciones."
            actions={
              <>
                <ButtonLink href="/admin/courses">Editar cursos</ButtonLink>
                <ButtonLink href="/admin/promotions" variant="secondary">Gestionar promociones</ButtonLink>
              </>
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Object.entries(overview).map(([key, value]) => (
              <MetricCard key={key} label={overviewLabels[key] || key.replace(/([A-Z])/g, ' $1')} value={value} />
            ))}
          </section>

          <section className="space-y-4">
            <SectionHeader
              eyebrow="Bandejas editoriales"
              title="Promociones por estado"
              description="Cada bloque funciona como una cola de trabajo para revisión, publicación, mejora de datos y archivo."
              action={<ButtonLink href="/admin/promotions" variant="secondary">Abrir gestor</ButtonLink>}
            />
            <Stagger className="grid gap-4 lg:grid-cols-2">
              {STATUSES.map((status) => (
                <StaggerItem key={status}>
                  <MotionCard className="ds-card p-4">
                    <h2 className="display-type text-xl font-black capitalize text-[var(--ink)]">
                      {status.replace(/_/g, ' ')} ({grouped[status].length})
                    </h2>
                    <div className="mt-3 space-y-2">
                      {grouped[status].slice(0, 4).map((promotion) => (
                        <div key={promotion.id} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-sm">
                          <p className="font-semibold text-[var(--ink)]">{promotion.title}</p>
                          <p className="text-[var(--ink-soft)]">
                            {promotion.municipality || 'Catalunya'} · {promotion.promotionType}
                          </p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <p className="text-xs text-[var(--ink-soft)]">{promotion.statusMessage || 'Pendiente de revisión'}</p>
                            <Link href={`/admin/promotions/${promotion.id}`} className="shrink-0 rounded-full bg-[var(--green-700)] px-3 py-1.5 text-xs font-semibold text-white">
                              Editar
                            </Link>
                          </div>
                        </div>
                      ))}
                      {grouped[status].length === 0 ? (
                        <p className="text-sm text-[var(--ink-soft)]">Sin promociones en este estado.</p>
                      ) : null}
                    </div>
                  </MotionCard>
                </StaggerItem>
              ))}
            </Stagger>
          </section>

          <SurfaceCard className="p-5">
            <SectionHeader
              eyebrow="Roadmap CMS"
              title="Flujo operativo de contenido"
              description="Base visual para extender con biblioteca multimedia, programación, versionado e historial de cambios."
            />
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {['Detectada', 'Revisión editorial', 'Publicación programada', 'Historial y archivo'].map((step) => (
                <div key={step} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold text-[var(--ink)]">
                  {step}
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
