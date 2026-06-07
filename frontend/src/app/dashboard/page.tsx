import { api } from '@/lib/api';
import { MetricCard, SectionHeader, SurfaceCard } from '@/components/design-system';

export default async function DashboardPage() {
  const [promotions, upcoming] = await Promise.all([
    api.getPromotions('?limit=10'),
    api.getUpcomingAlerts(),
  ]);

  return (
    <main className="shell space-y-6 pb-16">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Datos</p>
        <h1 className="display-type mt-2 text-3xl font-black text-[var(--ink)]">Dashboard Radar VPO</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Resumen limpio de oportunidades y avisos activos.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <MetricCard label="Promociones activas" value={promotions.length} />
        <MetricCard label="Avisos próximos" value={upcoming.length} />
      </section>

      <SurfaceCard className="p-5">
        <SectionHeader title="Últimas oportunidades" description="Solo datos esenciales para lectura rápida." />
        <div className="mt-4 divide-y divide-[var(--stroke)]">
          {promotions.map((promotion) => (
            <div key={promotion.id} className="grid gap-2 py-3 text-sm md:grid-cols-[1fr_160px_140px]">
              <span className="font-semibold text-[var(--ink)]">{promotion.title}</span>
              <span className="text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</span>
              <span className="text-[var(--ink-soft)]">{promotion.promotionType}</span>
            </div>
          ))}
          {promotions.length === 0 ? <p className="py-3 text-sm text-[var(--ink-soft)]">Sin datos disponibles.</p> : null}
        </div>
      </SurfaceCard>
    </main>
  );
}
