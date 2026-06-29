import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { PublicPage, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { ProComparison } from '@/components/pro-comparison';
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
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.upcomingLaunches, path: '/alerts' },
        ])}
      />

      <section className="lp-page-hero">
        <div className="lp-page-hero__backdrop" aria-hidden="true" />
        <div className="shell lp-page-hero__inner">
          <span className="lp-hero__badge">{copy.upcomingLaunches}</span>
          <h1 className="lp-page-hero__title">
            Sabe qué puede salir
            <span className="lp-hero__title-accent"> antes de que se publique</span>
          </h1>
          <p className="lp-page-hero__subtitle">
            Monitorizamos señales de vivienda protegida en Cataluña. Con VPO PRO recibes alertas por SMS y email al instante.
          </p>
          <div className="lp-hero__actions">
            <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
            <ButtonLink href="/promotions" variant="secondary" size="lg">Ver promociones publicadas</ButtonLink>
          </div>
        </div>
      </section>

      <PublicProBanner />

      <PublicSection id="lanzamientos">
        <SectionHeader
          title="Lanzamientos monitorizados"
          description="Oportunidades que aún no tienen convocatoria oficial pero muestran señales de publicación próxima."
        />
        {activeAlerts.length === 0 ? (
          <SurfaceCard premium className="mt-6 p-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">Sin lanzamientos previstos visibles ahora mismo.</p>
            <div className="mt-6">
              <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <Stagger className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <StaggerItem key={item.id}>
                <MotionCard className="public-card public-card--hover h-full p-5">
                  <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                  <p className="mt-4 text-base font-semibold text-[var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Cataluña'}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/promotions/${item.id}`} className="btn btn--primary">
                      Ver ficha
                    </Link>
                    <Link href={proHref} className="btn btn--secondary">
                      Recibir notificación
                    </Link>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </PublicSection>

      <PublicSection muted border>
        <ProComparison
          title="¿Por qué activar VPO PRO?"
          description="Entra cuando quieras a ver lanzamientos. PRO te avisa al móvil y al correo para no depender de acordarte."
        />
      </PublicSection>
    </PublicPage>
  );
}
