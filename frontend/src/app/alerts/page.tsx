import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import { ButtonLink, PageHero, SectionHeader } from '@/components/design-system';
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

  return (
    <main className="shell space-y-6 pb-10">
      <PageHero
        eyebrow="Avisos"
        title="Avisos importantes de vivienda pública"
        description="Una lista limpia de oportunidades que conviene vigilar sin ruido ni paneles innecesarios."
        actions={
          <>
            <ButtonLink href="/promotions">Buscar promociones</ButtonLink>
            <ButtonLink href="/account" variant="secondary">Configurar perfil</ButtonLink>
          </>
        }
      />

      {activeAlerts.length === 0 ? (
        <EmptyState title="Sin avisos activos" description="Ahora mismo no hay avisos dentro de la ventana de visibilidad." />
      ) : (
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Lista de avisos"
            title="Qué conviene vigilar"
            description="Tarjetas escaneables con título, municipio y contador de días."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <StaggerItem key={item.id}>
                <MotionCard className="ds-card h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                    <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-bold text-[var(--green-700)]">
                      Aviso activo
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold leading-6 text-[var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Catalunya'}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">Vigilar esta oportunidad</p>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </main>
  );
}
