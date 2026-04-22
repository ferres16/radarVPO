import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysSinceAlert(alertDate?: string, fallbackAlertDate?: string) {
  const reference = parseDate(alertDate) ?? parseDate(fallbackAlertDate);
  if (!reference) return null;
  return Math.floor((Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysSince: daysSinceAlert(item.alertDate, item.alertDetectedAt),
    }))
    .filter((entry): entry is { item: (typeof alerts)[number]; daysSince: number } => entry.daysSince !== null && entry.daysSince >= 0 && entry.daysSince <= 67);

  return (
    <main className="shell space-y-6 pb-10">
      <header className="rounded-[1.75rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(78,143,58,0.10),rgba(255,255,255,0.96))] p-6 shadow-card animate-fade-up">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Alertas activas</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[var(--ink)] md:text-4xl">
            Próximas viviendas por salir
          </h1>
          <p className="mt-3 max-w-2xl text-base text-[var(--ink-soft)]">
            Solo mostramos alertas detectadas en los últimos 67 días desde su fecha de alerta.
          </p>
        </div>
      </header>

      {activeAlerts.length === 0 ? (
        <EmptyState title="Sin alertas activas" description="Ahora mismo no hay alertas dentro de la ventana 0-67 días." />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeAlerts.map(({ item, daysSince }) => (
            <div key={item.id} className="space-y-2">
              <PromotionCard promotion={item} />
              <p className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)] shadow-card">
                Alerta detectada hace {daysSince} días.
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
