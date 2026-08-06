import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { AlertTimeline } from '@/components/saas/alert-timeline';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Próximos lanzamientos de vivienda protegida',
  description:
    'Promociones que todavía no han sido publicadas oficialmente pero que podrían aparecer próximamente en Cataluña.',
  path: '/alerts',
  keywords: ['próximos lanzamientos VPO', 'vivienda protegida Cataluña', 'avisos VPO'],
});

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  return (
    <PublicPage>
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.upcomingLaunches, path: '/alerts' },
        ])}
      />

      <PublicPageHero
        badge={copy.upcomingLaunches}
        title="Sabe qué puede salir"
        titleAccent="antes de que se publique"
        description="Monitorizamos señales de vivienda protegida en Cataluña. Consulta los lanzamientos aquí; con VPO PRO te avisamos por SMS y email."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href="/promotions" size="lg" block>
              Ver promociones publicadas
            </ButtonLink>
          </div>
        }
      />

      <PublicSection id="lanzamientos">
        <SectionHeader
          title="Timeline de lanzamientos"
          description="Cuenta atrás y ubicación. Activa VPO PRO para recibir avisos por SMS y email."
        />

        {alerts.length === 0 ? (
          <SurfaceCard premium className="empty-illus mt-6 border-0 shadow-none">
            <span className="empty-illus__icon" aria-hidden="true">⏱</span>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Sin lanzamientos previstos visibles ahora mismo.</p>
            <div className="mt-6">
              <ButtonLink href="/promotions" size="lg">
                Ver promociones publicadas
              </ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <div className="mt-6">
            <AlertTimeline alerts={alerts} />
          </div>
        )}
      </PublicSection>
    </PublicPage>
  );
}
