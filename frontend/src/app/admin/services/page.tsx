'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { EmptyState } from '@/components/empty-state';
import { SkeletonCard } from '@/components/skeleton-card';
import { StatusPill } from '@/components/status-pill';
import { api } from '@/lib/api';
import type { Service, ServiceStatus, ServiceType, UserProfile } from '@/types';

const emptyService: Partial<Service> = {
  key: '',
  name: '',
  description: '',
  price: '',
  currency: 'EUR',
  status: 'active',
  serviceType: 'manual',
  stripePaymentLink: '',
};

const statusOptions: ServiceStatus[] = ['active', 'inactive', 'archived'];
const typeOptions: ServiceType[] = ['one_time', 'subscription', 'manual'];

const statusTone = (status: ServiceStatus) => {
  if (status === 'active') return 'active';
  if (status === 'inactive') return 'warning';
  return 'locked';
};

export default function AdminServicesPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Partial<Service>>>({});
  const [newService, setNewService] = useState<Partial<Service>>(emptyService);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

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
        const rows = await api.getBackofficeServices();
        if (!active) return;
        setServices(rows);
        setDrafts(Object.fromEntries(rows.map((service) => [service.id, toDraft(service)])));
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar servicios');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const visibleServices = useMemo(() => {
    const term = query.trim().toLowerCase();
    return services.filter((service) => {
      if (!term) return true;
      return [service.key, service.name, service.description || ''].some((value) =>
        value.toLowerCase().includes(term),
      );
    });
  }, [query, services]);

  async function reload(nextQuery = query) {
    const rows = await api.getBackofficeServices(nextQuery);
    setServices(rows);
    setDrafts(Object.fromEntries(rows.map((service) => [service.id, toDraft(service)])));
  }

  async function createService() {
    if (!newService.key || !newService.name) {
      setError('Key y nombre son obligatorios.');
      return;
    }
    setSavingId('new');
    setError('');
    try {
      const created = await api.createBackofficeService({
        key: newService.key,
        name: newService.name,
        description: newService.description,
        price: newService.price,
        currency: newService.currency,
        status: newService.status as ServiceStatus,
        serviceType: newService.serviceType as ServiceType,
        stripePaymentLink: newService.stripePaymentLink,
      });
      setServices((prev) => [created, ...prev]);
      setDrafts((prev) => ({ ...prev, [created.id]: toDraft(created) }));
      setNewService(emptyService);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el servicio');
    } finally {
      setSavingId('');
    }
  }

  async function saveService(serviceId: string) {
    const payload = drafts[serviceId];
    if (!payload) return;
    setSavingId(serviceId);
    setError('');
    try {
      const updated = await api.updateBackofficeService(serviceId, payload);
      setServices((prev) => prev.map((service) => (service.id === serviceId ? updated : service)));
      setDrafts((prev) => ({ ...prev, [serviceId]: toDraft(updated) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el servicio');
    } finally {
      setSavingId('');
    }
  }

  async function archiveService(service: Service) {
    setSavingId(service.id);
    setError('');
    try {
      const updated = await api.updateBackofficeService(service.id, { status: 'archived' });
      setServices((prev) => prev.map((item) => (item.id === service.id ? updated : item)));
      setDrafts((prev) => ({ ...prev, [service.id]: toDraft(updated) }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo archivar el servicio');
    } finally {
      setSavingId('');
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
          <h1 className="text-2xl font-bold text-[var(--ink)]">Servicios</h1>
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
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--green-700)]">Backoffice</p>
        <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Servicios vendibles</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          Esta pantalla define los productos que vendes: seguimiento personalizado, asesorías 1:1, alertas PRO por WhatsApp y servicios manuales. Entra en juego cuando quieres poner precio, activar/desactivar el producto, añadir Payment Link de Stripe y después conceder acceso desde “Compras y Activaciones”.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/admin" className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)]">Panel</Link>
          <Link href="/admin/access" className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white">Compras y Activaciones</Link>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ['1. Crear producto', 'Nombre, precio, tipo y enlace de pago.'],
          ['2. Vender o activar', 'El usuario compra con Stripe o tú lo activas manualmente.'],
          ['3. Controlar acceso', 'En Compras y Activaciones decides quién tiene el servicio activo.'],
        ].map(([title, description]) => (
          <article key={title} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <p className="text-sm font-black text-[var(--ink)]">{title}</p>
            <p className="mt-1 text-sm text-[var(--ink-soft)]">{description}</p>
          </article>
        ))}
      </section>

      {error ? <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{error}</div> : null}

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <label className="text-sm font-semibold text-[var(--ink)]">
          Buscar servicios
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onBlur={() => void reload()}
            placeholder="guia_pro, alertas, seguimiento..."
            className="mt-2 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm"
          />
        </label>
      </section>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Nuevo servicio</h2>
        <ServiceFields value={newService} onChange={setNewService} />
        <button
          type="button"
          onClick={() => void createService()}
          disabled={savingId === 'new'}
          className="mt-4 rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {savingId === 'new' ? 'Creando...' : 'Crear servicio'}
        </button>
      </section>

      {visibleServices.length === 0 ? (
        <EmptyState title="Sin servicios" description="Crea el primer servicio para poder asignarlo a usuarios." />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {visibleServices.map((service) => {
          const draft = drafts[service.id] || toDraft(service);
          return (
            <article key={service.id} className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-[var(--ink)]">{service.name}</h2>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{service.key}</p>
                </div>
                <StatusPill label={service.status} tone={statusTone(service.status)} />
              </div>
              <ServiceFields
                value={draft}
                onChange={(next) => setDrafts((prev) => ({ ...prev, [service.id]: next }))}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void saveService(service.id)}
                  disabled={savingId === service.id}
                  className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {savingId === service.id ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => void archiveService(service)}
                  disabled={savingId === service.id || service.status === 'archived'}
                  className="rounded-xl border border-[var(--stroke)] px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-50"
                >
                  Archivar
                </button>
              </div>
            </article>
          );
        })}
      </section>
        </div>
      </div>
    </main>
  );
}

function toDraft(service: Service): Partial<Service> {
  return {
    key: service.key,
    name: service.name,
    description: service.description || '',
    price: service.price || '',
    currency: service.currency || 'EUR',
    status: service.status,
    serviceType: service.serviceType,
    stripePaymentLink: service.stripePaymentLink || '',
  };
}

function ServiceFields({
  value,
  onChange,
}: {
  value: Partial<Service>;
  onChange: (value: Partial<Service>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <input value={value.key || ''} onChange={(event) => onChange({ ...value, key: event.target.value })} placeholder="guia_pro" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />
      <input value={value.name || ''} onChange={(event) => onChange({ ...value, name: event.target.value })} placeholder="Guia PRO" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />
      <input value={value.price || ''} onChange={(event) => onChange({ ...value, price: event.target.value })} placeholder="Precio" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />
      <input value={value.currency || 'EUR'} onChange={(event) => onChange({ ...value, currency: event.target.value.toUpperCase() })} placeholder="EUR" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />
      <select value={value.status || 'active'} onChange={(event) => onChange({ ...value, status: event.target.value as ServiceStatus })} className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm">
        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
      </select>
      <select value={value.serviceType || 'manual'} onChange={(event) => onChange({ ...value, serviceType: event.target.value as ServiceType })} className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm">
        {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>
      <input value={value.stripePaymentLink || ''} onChange={(event) => onChange({ ...value, stripePaymentLink: event.target.value })} placeholder="https://buy.stripe.com/..." className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2" />
      <textarea value={value.description || ''} onChange={(event) => onChange({ ...value, description: event.target.value })} placeholder="Descripcion comercial del servicio" className="min-h-24 rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm md:col-span-2" />
    </div>
  );
}
