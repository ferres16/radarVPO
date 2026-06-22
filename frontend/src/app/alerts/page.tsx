import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { proHref, proPlan } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ButtonLink, Eyebrow, SurfaceCard } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Alertas prioritarias de vivienda protegida',
  description: 'VPO PRO envía alertas SMS y correo sobre nuevas oportunidades de vivienda protegida en Cataluña.',
  path: '/alerts',
  keywords: ['alertas VPO', 'VPO PRO', 'alertas SMS vivienda protegida'],
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
          { name: 'Alertas VPO', path: '/alerts' },
        ])}
      />

      <section className="mx-auto max-w-3xl text-center">
        <Eyebrow>Alertas VPO</Eyebrow>
        <h1 className="display-type mt-4 text-4xl font-black text-[var(--ink)] md:text-5xl">
          Entérate antes con {proPlan.name}
        </h1>
        <p className="mt-4 text-base leading-7 text-[var(--ink-soft)]">
          En la web ves avisos básicos. Con VPO PRO recibes SMS y correo cuando detectamos una oportunidad relevante.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
          <ButtonLink href="/promotions" variant="secondary">Ver promociones</ButtonLink>
        </div>
        <p className="mt-4 text-sm font-bold text-[var(--green-700)]">{proPlan.price}</p>
      </section>

      <section id="avisos" className="space-y-4">
        <h2 className="text-xl font-black text-[var(--ink)]">Avisos actuales</h2>
        {activeAlerts.length === 0 ? (
          <SurfaceCard className="p-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">Sin avisos activos. Activa VPO PRO para recibir el próximo por SMS y correo.</p>
            <div className="mt-6">
              <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <SurfaceCard key={item.id} className="p-5">
                <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                <p className="mt-4 text-base font-bold text-[var(--ink)]">{item.title}</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Cataluña'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link href={`/promotions/${item.id}`} className="rounded-full bg-[var(--green-700)] px-4 py-2 text-xs font-bold text-white">
                    Ver ficha
                  </Link>
                  {/^https?:\/\//.test(proHref) ? (
                    <a href={proHref} className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-bold text-[var(--ink)]" rel="noopener noreferrer" target="_blank">
                      Recibir por SMS/email
                    </a>
                  ) : (
                    <Link href={proHref} className="rounded-full border border-[var(--stroke)] px-4 py-2 text-xs font-bold text-[var(--ink)]">
                      Recibir por SMS/email
                    </Link>
                  )}
                </div>
              </SurfaceCard>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
