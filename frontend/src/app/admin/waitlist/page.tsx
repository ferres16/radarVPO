'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { api } from '@/lib/api';
import type { BackofficeWaitlistLead, UserProfile } from '@/types';

const PRODUCT_LABEL: Record<string, string> = {
  guide: 'Guía',
  pro: 'PRO',
  both: 'Guía + PRO',
};

export default function AdminWaitlistPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [leads, setLeads] = useState<BackofficeWaitlistLead[]>([]);
  const [query, setQuery] = useState('');
  const [productFilter, setProductFilter] = useState<'all' | 'guide' | 'pro' | 'both'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function load(search?: string) {
    const rows = await api.getBackofficeWaitlist(search?.trim() || undefined);
    setLeads(rows);
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
        await load();
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar la lista de espera');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (productFilter === 'all') return leads;
    return leads.filter((lead) => lead.product === productFilter);
  }, [leads, productFilter]);

  async function copyEmails() {
    const emails = [...new Set(filtered.map((lead) => lead.email))].join('\n');
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  }

  if (loading) {
    return (
      <main className="shell grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </main>
    );
  }

  if (error && (!me || me.role !== 'admin')) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h1 className="text-2xl font-bold text-[var(--ink)]">Lista de espera</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{error}</p>
        </article>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-4">
          <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">
              Backoffice
            </p>
            <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">
              Lista de espera
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Emails dejados cuando la venta online está cerrada (guía, PRO o ambos). No son compradores: aún no han
              pagado.
            </p>
            <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
              {filtered.length} {filtered.length === 1 ? 'lead' : 'leads'}
              {productFilter !== 'all' ? ` · filtro ${PRODUCT_LABEL[productFilter] || productFilter}` : ''}
            </p>
          </header>

          {error ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {error}
            </div>
          ) : null}

          <section className="rounded-3xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-sm font-semibold text-[var(--ink)]">
                Buscar
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void load(query).catch((err) => {
                      setError(err instanceof Error ? err.message : 'Error al buscar');
                    });
                  }}
                  placeholder="Email, producto, municipio…"
                  className="mt-2 block w-64 max-w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                />
              </label>
              <button
                type="button"
                className="rounded-xl bg-[var(--green-500)] px-3 py-2 text-sm font-semibold text-white"
                onClick={() => {
                  setError('');
                  void load(query).catch((err) => {
                    setError(err instanceof Error ? err.message : 'Error al buscar');
                  });
                }}
              >
                Buscar
              </button>
              <label className="text-sm font-semibold text-[var(--ink)]">
                Producto
                <select
                  value={productFilter}
                  onChange={(event) =>
                    setProductFilter(event.target.value as 'all' | 'guide' | 'pro' | 'both')
                  }
                  className="mt-2 block rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="guide">Guía</option>
                  <option value="pro">PRO</option>
                  <option value="both">Guía + PRO</option>
                </select>
              </label>
              <button
                type="button"
                className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                onClick={() => void copyEmails()}
                disabled={filtered.length === 0}
              >
                {copied ? 'Emails copiados' : 'Copiar emails'}
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptyState
                  title="Sin leads"
                  description="Cuando alguien deje su email con la venta cerrada, aparecerá aquí."
                />
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--stroke)] text-xs uppercase tracking-wide text-[var(--ink-soft)]">
                      <th className="px-2 py-2">Email</th>
                      <th className="px-2 py-2">Producto</th>
                      <th className="px-2 py-2">Municipio</th>
                      <th className="px-2 py-2">Origen</th>
                      <th className="px-2 py-2">Fecha</th>
                      <th className="px-2 py-2">Marketing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead) => (
                      <tr key={lead.id} className="border-b border-[var(--stroke)]/70">
                        <td className="px-2 py-2 font-semibold text-[var(--ink)]">{lead.email}</td>
                        <td className="px-2 py-2 text-[var(--ink)]">
                          {PRODUCT_LABEL[lead.product] || lead.product}
                        </td>
                        <td className="px-2 py-2 text-[var(--ink-soft)]">{lead.municipality || '—'}</td>
                        <td className="max-w-[12rem] truncate px-2 py-2 text-xs text-[var(--ink-soft)]">
                          {lead.sourcePath || '—'}
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 text-xs text-[var(--ink-soft)]">
                          {new Date(lead.createdAt).toLocaleString('es-ES')}
                        </td>
                        <td className="px-2 py-2 text-xs text-[var(--ink-soft)]">
                          {lead.marketingConsentAt ? 'Sí' : 'No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
