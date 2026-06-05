import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysRemaining: getDaysRemaining(item.estimatedPublicationDate),
    }))
    .filter((entry): entry is { item: (typeof alerts)[number]; daysRemaining: number } => shouldShowAlert(entry.daysRemaining));

  const alertTypes = [
    { label: 'Informativas', value: alerts.length },
    { label: 'Nuevas promociones', value: activeAlerts.length },
    { label: 'Apertura de solicitudes', value: activeAlerts.filter(({ daysRemaining }) => daysRemaining <= 3).length },
    { label: 'Recordatorios', value: activeAlerts.filter(({ daysRemaining }) => daysRemaining > 3).length },
  ];

  return (
    <main className="shell space-y-6 pb-10">
      <PageHero
        eyebrow="Centro de notificaciones"
        title="Alertas claras para no perder una oportunidad"
        description="Historial visual de avisos, nuevas promociones, aperturas de solicitudes y recordatorios relevantes."
        actions={
          <>
            <ButtonLink href="/promotions">Buscar promociones</ButtonLink>
            <ButtonLink href="/account" variant="secondary">Configurar perfil</ButtonLink>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {alertTypes.map((type) => (
            <SurfaceCard key={type.label} className="p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{type.label}</p>
              <p className="display-type mt-2 text-3xl font-black text-[var(--ink)]">{type.value}</p>
            </SurfaceCard>
          ))}
        </div>
      </PageHero>

      <section className="rounded-[1.5rem] border border-[var(--stroke)] bg-white/86 p-3 shadow-sm">
        <div className="flex gap-2 overflow-x-auto" role="list" aria-label="Filtros visuales de alertas">
          {['Todas', 'No leídas', 'Promociones', 'Solicitudes', 'Recordatorios', 'Historial'].map((filter, index) => (
            <span
              key={filter}
              role="listitem"
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold ${index === 0 ? 'border-[var(--green-700)] bg-[var(--bg-eco)] text-[var(--green-700)]' : 'border-[var(--stroke)] bg-white text-[var(--ink)]'}`}
            >
              {filter}
            </span>
          ))}
        </div>
      </section>

      {activeAlerts.length === 0 ? (
        <EmptyState title="Sin alertas activas" description="Ahora mismo no hay alertas dentro de la ventana de visibilidad." />
      ) : (
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Alertas filtrables"
            title="Avisos activos"
            description="El estado leído/no leído queda preparado visualmente para conectarlo a persistencia de usuario."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }, index) => (
              <StaggerItem key={item.id}>
                <MotionCard className="ds-card h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${index < 2 ? 'bg-[rgba(167,28,32,0.08)] text-[var(--accent-red)]' : 'bg-[var(--bg-app)] text-[var(--ink-soft)]'}`}>
                      {index < 2 ? 'No leída' : 'Leída'}
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold leading-6 text-[var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Catalunya'}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-[var(--ink-soft)]">
                    <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">Nueva promoción</span>
                    <span className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1">Recordatorio</span>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </main>
  );
}
