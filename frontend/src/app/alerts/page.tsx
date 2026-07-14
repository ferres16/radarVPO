import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { PublicPage, PublicPageHero, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { PublicHeroProActions, PublicInlineProCta, PublicProSection } from '@/components/conversion/public-pro-actions';
import { SectionHeader, SurfaceCard } from '@/components/design-system';
import { AlertTimeline } from '@/components/saas/alert-timeline';
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
  const activeAlerts = alerts.filter((item) => item.type === 'alert');

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
        description="Monitorizamos señales de vivienda protegida en Cataluña. Gratis puedes consultar lanzamientos en la web; con VPO PRO recibes avisos por SMS y email."
        actions={
          <PublicHeroProActions
            secondaryHref="/promotions"
            secondaryLabel="Ver publicadas"
          />
        }
      />

      <PublicProBanner />

      <PublicSection id="lanzamientos">
        <SectionHeader
          title="Timeline de lanzamientos"
          description="Cuenta atrás, ubicación y acceso a ficha en un solo vistazo."
        />

        {activeAlerts.length === 0 ? (
          <SurfaceCard premium className="empty-illus mt-6 border-0 shadow-none">
            <span className="empty-illus__icon" aria-hidden="true">⏱</span>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Sin lanzamientos previstos visibles ahora mismo.</p>
            <div className="mt-6">
              <PublicInlineProCta />
            </div>
          </SurfaceCard>
        ) : (
          <div className="mt-6">
            <AlertTimeline alerts={activeAlerts} />
          </div>
        )}
      </PublicSection>

      <PublicSection muted border>
        <SectionHeader
          title="¿Por qué activar VPO PRO?"
          description="La web es gratis para consultar. PRO añade avisos por email y SMS, y el curso Guía VPO."
        />
        <PublicProSection />
      </PublicSection>
    </PublicPage>
  );
}
