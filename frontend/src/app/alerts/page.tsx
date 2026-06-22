import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { ProComparison } from '@/components/pro-comparison';
import { RadarVisual } from '@/components/radar-visual';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Próximos lanzamientos de vivienda protegida',
  description:
    'Promociones que todavía no han sido publicadas oficialmente pero que podrían aparecer próximamente en Cataluña.',
  path: '/alerts',
  keywords: ['próximos lanzamientos VPO', 'VPO PRO', 'vivienda protegida Cataluña'],
});

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysRemaining: getDaysRemaining(item.estimatedPublicationDate),
    }));

  return (
    <main className="shell space-y-10 pb-16">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.upcomingLaunches, path: '/alerts' },
        ])}
      />

      <PageHero
        eyebrow={copy.upcomingLaunches}
        title="Sabe qué puede salir antes de que se publique"
        description="Aquí ves los próximos lanzamientos que estamos monitorizando. Con VPO PRO recibes notificaciones por SMS y correo en cuanto detectamos novedad relevante."
        actions={
          <>
            <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/promotions" variant="secondary">Ver promociones publicadas</ButtonLink>
          </>
        }
      >
        <RadarVisual />
      </PageHero>

      <SurfaceCard premium className="flex flex-col gap-4 bg-[var(--bg-eco)]/60 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">{proPlan.name}</p>
          <p className="mt-1 text-sm font-semibold text-[var(--ink)]">¿No quieres entrar cada día a revisar?</p>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">Te avisamos cuando detectemos un próximo lanzamiento en tu zona. {proPlan.price}</p>
        </div>
        <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
      </SurfaceCard>

      <section id="lanzamientos" className="space-y-4">
        <SectionHeader
          title="Lanzamientos monitorizados"
          description="Oportunidades que aún no tienen convocatoria oficial pero muestran señales de publicación próxima."
        />
        {activeAlerts.length === 0 ? (
          <SurfaceCard premium className="p-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">Sin lanzamientos previstos visibles ahora mismo. Activa VPO PRO para recibir el siguiente por SMS y correo.</p>
            <div className="mt-6">
              <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <SurfaceCard key={item.id} premium className="p-5">
                <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                <p className="mt-4 text-base font-bold text-[var(--ink)]">{item.title}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Cataluña'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/promotions/${item.id}`} className="rounded-full bg-[var(--green-700)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--green-900)]">
                    Ver ficha
                  </Link>
                  {/^https?:\/\//.test(proHref) ? (
                    <a href={proHref} className="rounded-full border border-[var(--stroke-strong)] bg-white/90 px-4 py-2 text-xs font-bold text-[var(--ink)]" rel="noopener noreferrer" target="_blank">
                      Recibir notificación
                    </a>
                  ) : (
                    <Link href={proHref} className="rounded-full border border-[var(--stroke-strong)] bg-white/90 px-4 py-2 text-xs font-bold text-[var(--ink)]">
                      Recibir notificación
                    </Link>
                  )}
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>

      <ProComparison
        title="¿Por qué activar VPO PRO?"
        description="Entra cuando quieras a ver lanzamientos. PRO te avisa al móvil y al correo para no depender de acordarte."
      />
    </main>
  );
}
