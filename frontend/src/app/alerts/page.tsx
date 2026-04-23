import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysRemaining: getDaysRemaining(item.estimatedPublicationDate),
    }))
    .filter((entry): entry is { item: (typeof alerts)[number]; daysRemaining: number } => shouldShowAlert(entry.daysRemaining));

  return (
    <main className="shell space-y-6 pb-10">
      <header className="rounded-[1.75rem] border border-(--stroke) bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.96))] p-6 shadow-card animate-fade-up">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--green-700)">Alertas activas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-(--ink) md:text-4xl">
            Próximas viviendas por salir
          </h1>
          <p className="mt-3 max-w-2xl text-base text-(--ink-soft)">
            Solo mostramos alertas dentro de la ventana de visibilidad: desde hoy hasta 7 días después de su fecha estimada de publicación.
          </p>
        </div>
      </header>

      {activeAlerts.length === 0 ? (
        <EmptyState title="Sin alertas activas" description="Ahora mismo no hay alertas dentro de la ventana de visibilidad." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeAlerts.map(({ item, daysRemaining }) => (
            <div key={item.id} className="rounded-3xl border border-[rgba(78,143,58,0.22)] bg-[linear-gradient(135deg,rgba(78,143,58,0.08),rgba(255,255,255,0.96))] p-4 shadow-card transition hover:-translate-y-0.5">
              <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
              <p className="mt-4 text-base font-semibold leading-6 text-(--ink)">{item.title}</p>
              <p className="mt-2 text-sm text-(--ink-soft)">{item.municipality || 'Catalunya'}</p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
