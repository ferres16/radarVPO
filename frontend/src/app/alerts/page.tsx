import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { ProofStats } from '@/components/conversion/proof-stats';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { AlertsProCtaBand } from '@/components/conversion/alerts-pro-cta-band';
import { AlertTimeline } from '@/components/saas/alert-timeline';
import { StructuredData } from '@/components/structured-data';
import { buildProofItems } from '@/lib/catalog-stats';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import {
  isAlertCancellationNotice,
  isAmendmentPublication,
  isProperaAdjudicacioAlert,
} from '@/lib/promotion-content-filters';

export const metadata: Metadata = createMetadata({
  title: 'Próximos lanzamientos de vivienda protegida',
  description:
    'Promociones que todavía no han sido publicadas oficialmente pero que podrían aparecer próximamente en Cataluña.',
  path: '/alerts',
  keywords: ['próximos lanzamientos VPO', 'vivienda protegida Cataluña', 'avisos VPO'],
});

export default async function AlertsPage() {
  const [rawAlerts, stats] = await Promise.all([
    api.getAlerts().catch(() => []),
    api.getCatalogStats().catch(() => null),
  ]);
  const alerts = rawAlerts.filter((item) => {
    // Solo "ALERTA: Propera adjudicació…". AVÍS de anulación no es lanzamiento.
    if (!isProperaAdjudicacioAlert(item.title)) return false;
    if (isAlertCancellationNotice(item.title)) return false;
    if (isAmendmentPublication(item.title)) return false;
    const daysRemaining = getDaysRemaining(item.estimatedPublicationDate);
    return daysRemaining === null || shouldShowAlert(daysRemaining);
  });
  const proofItems = [
    ...(alerts.length > 0
      ? [
          {
            value: String(alerts.length),
            label: alerts.length === 1 ? 'lanzamiento estimado' : 'lanzamientos estimados',
          },
        ]
      : []),
    ...buildProofItems(stats).filter((item) => item.label !== 'consultar el PDF oficial'),
    { value: '0 €', label: 'consultar el PDF oficial' },
  ];

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
        title="Próximos lanzamientos"
        titleAccent="con días estimados"
        description="Promociones que podrían publicarse próximamente en Cataluña. Los días restantes son una estimación: pueden no cumplirse o no llegar a publicarse. Con Radar VPO PRO te avisamos por SMS y email."
        actions={
          <div className="lp-hero__actions lp-hero__actions--stack">
            <ButtonLink href="/promotions" size="lg" block>
              Ver promociones publicadas
            </ButtonLink>
          </div>
        }
        footer={<ProofStats items={proofItems} />}
      />

      <PublicSection id="lanzamientos" animated={false}>
        <SectionHeader
          title="Lanzamientos previstos"
          description="Días estimados restantes y municipio. La única fecha oficial es la de publicación de la promoción."
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

      <PublicSection animated={false} muted border>
        <AlertsProCtaBand
          title="Avisos cuando se confirme una publicación"
          description="Estas fechas son estimaciones. Con Radar VPO PRO te avisamos por email y SMS cuando se publica una promoción o detectamos un próximo lanzamiento."
          ctaLabel="Ver Radar VPO PRO"
        />
      </PublicSection>
    </PublicPage>
  );
}
