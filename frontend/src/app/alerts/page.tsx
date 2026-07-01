import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { PublicPage, PublicPageHero, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
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
        description="Monitorizamos señales de vivienda protegida en Cataluña. Con VPO PRO recibes alertas por SMS y email al instante."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href={proHref} size="lg" block>
              {proPlan.ctaLabel}
            </ButtonLink>
            <ButtonLink href="/promotions" variant="secondary" size="lg" block>
              Ver publicadas
            </ButtonLink>
          </div>
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
              <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
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
          description="Entra cuando quieras a ver lanzamientos. PRO te avisa al móvil y al correo para no depender de acordarte."
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <ButtonLink href={proHref} size="lg">{proPlan.ctaLabel}</ButtonLink>
          <Link href="/register?intent=pro" className="btn btn--secondary btn--lg min-h-11">
            Crear cuenta
          </Link>
        </div>
      </PublicSection>
    </PublicPage>
  );
}
