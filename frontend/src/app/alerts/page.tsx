import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { AlertsProCtaBand } from '@/components/conversion/alerts-pro-cta-band';
import { AlertTimeline } from '@/components/saas/alert-timeline';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import {
  isAlertCancellationNotice,
  isAmendmentPublication,
  isProperaAdjudicacioAlert,
} from '@/lib/promotion-content-filters';

export const metadata: Metadata = createMetadata({
  title: 'Avisos previos de vivienda protegida',
  description:
    'Anuncios previos a una convocatoria de vivienda protegida en Cataluña. Las fechas son estimaciones, no publicaciones oficiales.',
  path: '/alerts',
  keywords: ['avisos previos VPO', 'vivienda protegida Cataluña', 'próximos lanzamientos VPO'],
});

export default async function AlertsPage() {
  const rawAlerts = await api.getAlerts().catch(() => []);
  const alerts = rawAlerts.filter((item) => {
    // Solo "ALERTA: Propera adjudicació…". AVÍS de anulación no es lanzamiento.
    if (!isProperaAdjudicacioAlert(item.title)) return false;
    if (isAlertCancellationNotice(item.title)) return false;
    if (isAmendmentPublication(item.title)) return false;
    const daysRemaining = getDaysRemaining(item.estimatedPublicationDate);
    return daysRemaining === null || shouldShowAlert(daysRemaining);
  });

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
        title="Avisos previos"
        titleAccent="antes de la convocatoria"
        description="Son anuncios previos, no bases publicadas. La fecha que ves es una estimación: puede retrasarse o no publicarse. El anuncio de origen está enlazado en cada aviso."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href="/promotions" size="lg" block>
              Ver promociones publicadas
            </ButtonLink>
          </div>
        }
      />

      <PublicSection id="lanzamientos" animated={false}>
        <SectionHeader
          title="Avisos con estimación"
          description="Priorizamos la ubicación y la fuente. La única fecha oficial es la de publicación de la promoción."
        />

        {alerts.length === 0 ? (
          <SurfaceCard premium className="empty-illus mt-6 border-0 shadow-none">
            <span className="empty-illus__icon" aria-hidden="true">
              ○
            </span>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">Sin avisos previos visibles ahora mismo.</p>
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

      <PublicSection animated={false} muted border>
        <AlertsProCtaBand
          title="¿Quieres enterarte cuando se publique?"
          description="Consultar avisos previos y promociones es gratis. Radar PRO añade avisos por email y SMS de novedades detectadas."
          ctaLabel="Ver Radar PRO"
        />
      </PublicSection>
    </PublicPage>
  );
}
