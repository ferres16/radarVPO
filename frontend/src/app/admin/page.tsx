'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, MetricCard, PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { BackofficeOverview } from '@/types';

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatMoney(amount: number | null, currency: string | null) {
  if (amount == null) return '—';
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: (currency || 'EUR').toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency || ''}`.trim();
  }
}

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
          <p className="text-sm text-[var(--ink-soft)]">Cargando panel de administración…</p>
        </article>
      </main>
    );
  }

  if (error || !overview) {
    return (
      <main className="shell">
        <article className="ds-card p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Panel de administración</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Accede primero con una cuenta de administrador desde{' '}
            <Link href="/login" className="font-semibold text-[var(--green-700)]">
              iniciar sesión
            </Link>
            .
          </p>
          {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
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
            title="Ventas, PRO activos y operación"
            description="Resumen comercial y accesos directos. Quién tiene PRO y quién ha comprado cursos está abajo."
            actions={
              <>
                <ButtonLink href="/admin/users">Usuarios</ButtonLink>
                <ButtonLink href="/admin/access" variant="secondary">
                  Compras y accesos
                </ButtonLink>
              </>
            }
          />

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="PRO activos" value={overview.activeProUsers} />
            <MetricCard label="Cursos vendidos" value={overview.courseSalesPaid} />
            <MetricCard label="Compradores de curso" value={overview.courseBuyersUnique} />
            <MetricCard label="Usuarios totales" value={overview.users} />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Bajas PRO pendientes" value={overview.pendingCancellations} />
            <MetricCard label="Avisos pendientes" value={overview.pendingReview} />
            <MetricCard label="Promociones" value={overview.promotions} />
            <MetricCard label="Fallos jobs" value={overview.jobsFailed} />
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <SurfaceCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">
                    PRO activos
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[var(--ink)]">
                    {overview.activeProUsers}{' '}
                    {overview.activeProUsers === 1 ? 'persona' : 'personas'}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Plan PRO o suscripción Stripe activa/trialing.
                  </p>
                </div>
                <Link
                  href="/admin/users"
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                >
                  Gestionar
                </Link>
              </div>

              <div className="mt-4 max-h-[28rem] space-y-2 overflow-auto">
                {overview.activeProPeople.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                    Nadie con PRO activo ahora mismo.
                  </p>
                ) : (
                  overview.activeProPeople.map((person) => (
                    <Link
                      key={person.id}
                      href={`/admin/users?q=${encodeURIComponent(person.email)}`}
                      className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 hover:bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {person.fullName?.trim() || person.email}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)]">{person.email}</p>
                          {person.phone ? (
                            <p className="text-xs text-[var(--ink-soft)]">{person.phone}</p>
                          ) : null}
                        </div>
                        <div className="text-right text-xs text-[var(--ink-soft)]">
                          <p>{person.subscriptionStatus || person.plan}</p>
                          <p>Desde {formatDate(person.createdAt)}</p>
                          {person.proCancellationRequestedAt ? (
                            <p className="font-semibold text-amber-800">Baja pendiente</p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">
                    Cursos vendidos
                  </p>
                  <h2 className="mt-2 text-xl font-black text-[var(--ink)]">
                    {overview.courseSalesPaid} ventas · {overview.courseBuyersUnique}{' '}
                    {overview.courseBuyersUnique === 1 ? 'persona' : 'personas'}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Compras pagadas (últimas {overview.recentCourseSales.length}).
                  </p>
                </div>
                <Link
                  href="/admin/access"
                  className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                >
                  Accesos
                </Link>
              </div>

              <div className="mt-4 max-h-[28rem] space-y-2 overflow-auto">
                {overview.recentCourseSales.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm text-[var(--ink-soft)]">
                    Todavía no hay ventas de cursos pagadas.
                  </p>
                ) : (
                  overview.recentCourseSales.map((sale) => (
                    <Link
                      key={sale.id}
                      href={`/admin/users?q=${encodeURIComponent(sale.user.email)}`}
                      className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 hover:bg-white"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-[var(--ink)]">
                            {sale.user.fullName?.trim() || sale.user.email}
                          </p>
                          <p className="text-xs text-[var(--ink-soft)]">{sale.user.email}</p>
                          <p className="mt-1 text-sm text-[var(--ink)]">
                            {sale.course?.title || sale.productKey}
                          </p>
                        </div>
                        <div className="text-right text-xs text-[var(--ink-soft)]">
                          <p className="font-semibold text-[var(--ink)]">
                            {formatMoney(sale.amount, sale.currency)}
                          </p>
                          <p>{formatDate(sale.purchasedAt)}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </SurfaceCard>
          </div>

          <SurfaceCard className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">
              Accesos rápidos
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {[
                ['/admin/users', 'Usuarios (eliminar / editar)'],
                ['/admin/access', 'Compras y accesos'],
                ['/admin/cancellations', 'Bajas PRO'],
                ['/admin/promotions', 'Promociones'],
                ['/admin/courses', 'Cursos CMS'],
                ['/admin/commerce', 'Comercio'],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold text-[var(--ink)] hover:bg-white"
                >
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
