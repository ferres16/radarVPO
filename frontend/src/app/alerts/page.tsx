import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';

function parseDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function daysUntilPublication(promotion: {
  estimatedPublicationDate?: string | null;
  alertDate?: string;
  alertDetectedAt?: string;
}) {
  const estimatedPublicationDate = parseDate(promotion.estimatedPublicationDate);
  if (estimatedPublicationDate) {
    return Math.floor((estimatedPublicationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }

  const reference = parseDate(promotion.alertDate) ?? parseDate(promotion.alertDetectedAt);
  if (!reference) return null;
  return Math.floor((Date.now() - reference.getTime()) / (1000 * 60 * 60 * 24));
}

function publicationEtaText(daysUntil?: number | null) {
  if (daysUntil === null || daysUntil === undefined) {
    return 'Sin fecha estimada disponible.';
  }

  if (daysUntil > 0) {
    return `Faltan ${daysUntil} días para la publicación estimada.`;
  }
  if (daysUntil === 0) {
    return 'Publicación estimada para hoy.';
  }
  return `Publicación estimada vencida hace ${Math.abs(daysUntil)} días.`;
}

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysUntil: daysUntilPublication(item),
    }))
    .filter((entry): entry is { item: (typeof alerts)[number]; daysUntil: number } => entry.daysUntil !== null && entry.daysUntil >= -67 && entry.daysUntil <= 67);

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
          {activeAlerts.map(({ item, daysUntil }) => (
            <div key={item.id} className="rounded-2xl border border-[rgba(78,143,58,0.22)] bg-[linear-gradient(135deg,rgba(78,143,58,0.08),rgba(255,255,255,0.94))] p-4 shadow-card">
              <p className="text-base font-semibold text-[var(--ink)]">{item.title}</p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Catalunya'}</p>
              <p className="mt-3 rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm text-[var(--ink-soft)]">
                {publicationEtaText(daysUntil)}
              </p>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
