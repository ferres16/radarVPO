'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, MetricCard, PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { BackofficeOverview } from '@/types';

const overviewLabels: Record<string, string> = {
  users: 'Usuarios',
  promotions: 'Promociones',
  pendingReview: 'Avisos pendientes',
  publishedUnreviewed: 'Publicadas sin revisar',
  publishedReviewed: 'Publicadas revisadas',
  archived: 'Archivadas',
  news: 'Noticias',
  jobsFailed: 'Fallos jobs',
};

export default function AdminPage() {
  const [overview, setOverview] = useState<BackofficeOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const nextOverview = await api.getBackofficeOverview();
        if (!active) return;
        setOverview(nextOverview);
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

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-6">
          <PageHero
            eyebrow="Panel de administración"
            title="Centro operativo para contenido, usuarios y promociones"
            description="Solo datos clave y accesos directos. La gestión operativa está separada en Promociones, Avisos, Cursos, Servicios y Compras."
            actions={
              <>
                <ButtonLink href="/admin/promotions">Promociones</ButtonLink>
                <ButtonLink href="/admin/alerts" variant="secondary">Avisos</ButtonLink>
              </>
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Object.entries(overview).map(([key, value]) => (
              <MetricCard key={key} label={overviewLabels[key] || key.replace(/([A-Z])/g, ' $1')} value={value} />
            ))}
          </section>

          <SurfaceCard className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Accesos de gestión</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ['/admin/promotions', '10 promociones principales'],
                ['/admin/promotions/history', 'Histórico'],
                ['/admin/alerts', 'Avisos pendientes'],
                ['/admin/courses', 'Cursos'],
                ['/admin/services', 'Servicios'],
                ['/admin/access', 'Compras y accesos'],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold text-[var(--ink)] hover:bg-white">
                  {label}
                </Link>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </main>
  );
}
