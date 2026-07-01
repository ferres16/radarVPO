import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import { PublicPage, PublicPageHero, PublicProBanner, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { AlertTimeline } from '@/components/saas/alert-timeline';
import { AlertsHeroVisual } from '@/components/saas/hero-visuals';
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
        badge="Radar activo"
        title="Detectamos señales"
        titleAccent="antes de la publicación oficial"
        description="Monitorizamos el mercado VPO en Cataluña. Con PRO recibes SMS y email cuando hay movimiento relevante."
        proof={['Timeline con cuenta atrás', 'Señales antes del BOE', 'Avisos prioritarios con PRO']}
        trustNote={proPlan.price}
        visual={<AlertsHeroVisual />}
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
        <div className="mt-4 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
          <ButtonLink href={proHref} size="lg" block className="sm:!inline-flex sm:!w-auto">
            {proPlan.ctaLabel}
          </ButtonLink>
          <Link href="/register?intent=pro" className="btn btn--secondary btn--lg btn--block sm:!inline-flex sm:!w-auto">
            Crear cuenta
          </Link>
        </div>
      </PublicSection>
    </PublicPage>
  );
}
