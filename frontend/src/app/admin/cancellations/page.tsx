'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { PageHero, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import type { BackofficeCancellationRequest, UserProfile } from '@/types';

function formatDate(value: string | null) {
  if (!value) return 'n/d';
  return new Date(value).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AdminCancellationsPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [requests, setRequests] = useState<BackofficeCancellationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState('');
  const [message, setMessage] = useState('');

  async function loadRequests() {
    const rows = await api.getBackofficeCancellations();
    setRequests(rows);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador.');
          return;
        }
        await loadRequests();
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las anulaciones');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function processRequest(userId: string) {
    setProcessingId(userId);
    setError('');
    setMessage('');
    try {
      await api.processBackofficeCancellation(userId);
      setRequests((prev) => prev.filter((item) => item.id !== userId));
      setMessage('Baja procesada. El usuario ya no tiene VPO PRO.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la baja');
    } finally {
      setProcessingId('');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <p className="text-sm text-[var(--ink-soft)]">Cargando anulaciones...</p>
        </article>
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Anulaciones PRO</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
          <Link href="/admin" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white">
            Volver al panel
          </Link>
        </article>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
          <PageHero
            eyebrow="Backoffice"
            title="Anulaciones VPO PRO"
            description="Cuando un usuario solicita la baja, recibes un correo por Brevo y la petición queda aquí hasta que la proceses en Stripe y en Radar VPO."
          />

          {error ? (
            <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </article>
          ) : null}
          {message ? (
            <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              {message}
            </article>
          ) : null}

          {requests.length === 0 ? (
            <SurfaceCard className="p-6 text-center text-sm text-[var(--ink-soft)]">
              No hay solicitudes de baja pendientes.
            </SurfaceCard>
          ) : (
            <section className="grid gap-3">
              {requests.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-[var(--stroke)] bg-white p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Baja pendiente
                      </p>
                      <h2 className="mt-1 text-lg font-black text-[var(--ink)]">
                        {item.fullName || item.email}
                      </h2>
                      <p className="break-all text-sm text-[var(--ink-soft)]">{item.email}</p>
                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Teléfono</dt>
                          <dd className="font-semibold text-[var(--ink)]">{item.phone || 'n/d'}</dd>
                        </div>
                        <div>
                          <dt className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Solicitado</dt>
                          <dd className="font-semibold text-[var(--ink)]">
                            {formatDate(item.proCancellationRequestedAt)}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">Stripe</dt>
                          <dd className="break-all font-semibold text-[var(--ink)]">
                            {item.stripeCustomerId || 'Sin customer vinculado'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    <button
                      type="button"
                      onClick={() => void processRequest(item.id)}
                      disabled={processingId === item.id}
                      className="btn btn--primary min-h-11 w-full shrink-0 sm:w-auto"
                    >
                      {processingId === item.id ? 'Procesando...' : 'Procesar baja'}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
