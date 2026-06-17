import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { proHref, proPlan } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Alertas SMS y email de vivienda protegida',
  description:
    'Radar VPO Pro envía alertas SMS y correo sobre nuevas oportunidades de vivienda protegida en Cataluña, con curso de iniciación incluido.',
  path: '/alerts',
  keywords: ['alertas SMS VPO', 'alertas email vivienda protegida', 'Radar VPO Pro'],
});

const faqs = [
  {
    question: '¿Qué diferencia hay entre alertas Free y Pro?',
    answer: 'Free te permite consultar avisos en la web. Pro añade alertas por SMS y correo para no depender de entrar manualmente.',
  },
  {
    question: '¿Cuándo se envía un SMS?',
    answer: 'Cuando detectemos una oportunidad relevante o una ventana de publicación que convenga revisar con rapidez.',
  },
  {
    question: '¿El curso está incluido?',
    answer: `Sí. ${proPlan.name} incluye el curso de iniciación a la vivienda pública para entender requisitos y documentación.`,
  },
];

const channels = [
  ['Web', 'Avisos visibles dentro de Radar VPO para revisar cuando entres.', 'Free'],
  ['Email', 'Resumen accionable con contexto, municipio y siguiente paso recomendado.', 'Pro'],
  ['SMS', 'Aviso corto para oportunidades sensibles al tiempo.', 'Pro'],
];

export default async function AlertsPage() {
  const alerts = await api.getAlerts().catch(() => []);

  const activeAlerts = alerts
    .filter((item) => item.type === 'alert')
    .map((item) => ({
      item,
      daysRemaining: getDaysRemaining(item.estimatedPublicationDate),
    }));

  return (
    <main className="shell space-y-6 pb-10">
      <StructuredData
        data={[
          breadcrumbJsonLd([
            { name: 'Inicio', path: '/' },
            { name: 'Alertas VPO', path: '/alerts' },
          ]),
          faqJsonLd(faqs),
        ]}
      />
      <PageHero
        eyebrow="Alertas Radar VPO Pro"
        title="Recibe oportunidades por SMS y correo cuando todavía estás a tiempo"
        description={`${proPlan.name} convierte el radar de vivienda protegida en avisos directos: SMS para lo urgente, email para contexto y curso incluido para saber cómo actuar.`}
        actions={
          <>
            <ButtonLink href={proHref}>Activar Pro por {proPlan.price}</ButtonLink>
            <ButtonLink href="#avisos" variant="secondary">Ver avisos actuales</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Canales incluidos</p>
          <div className="mt-4 grid gap-3">
            {channels.map(([name, copy, plan]) => (
              <div key={name} className="rounded-2xl border border-[var(--stroke)] bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[var(--ink)]">{name}</p>
                  <span className={`rounded-full px-2 py-1 text-[11px] font-black ${plan === 'Pro' ? 'bg-[var(--green-700)] text-white' : 'bg-[var(--bg-app)] text-[var(--ink-soft)]'}`}>
                    {plan}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{copy}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['No revises portales cada día', 'Radar VPO monitoriza oportunidades para que el aviso llegue a ti.'],
          ['Prioriza lo que importa', 'SMS para urgencia y correo para entender contexto, requisitos y plazos.'],
          ['Aprende antes de solicitar', `Pro incluye el ${proPlan.courseLabel.toLowerCase()}.`],
        ].map(([title, copy]) => (
          <SurfaceCard key={title} className="p-5">
            <h2 className="display-type text-2xl font-black text-[var(--ink)]">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{copy}</p>
          </SurfaceCard>
        ))}
      </section>

      <section id="avisos" className="space-y-4">
        <SectionHeader
          eyebrow="Avisos actuales"
          title="Esto es lo que Pro te ayuda a no perder"
          description="Puedes revisar avisos desde la web, pero el valor de Pro es recibirlos sin tener que entrar."
          action={<ButtonLink href={proHref}>Quiero alertas SMS/email</ButtonLink>}
        />
        {activeAlerts.length === 0 ? (
          <SurfaceCard className="p-8 text-center">
            <h2 className="display-type text-2xl font-black text-[var(--ink)]">Sin avisos activos ahora mismo</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              El momento importante es el próximo aviso. Activa Pro para recibirlo por SMS y correo cuando aparezca.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href={proHref}>Activar Radar VPO Pro</ButtonLink>
              <ButtonLink href="/promotions" variant="secondary">Ver promociones publicadas</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <StaggerItem key={item.id}>
                <MotionCard className="ds-card h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                    <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-bold text-[var(--green-700)]">
                      Aviso web
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold leading-6 text-[var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Cataluña'}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/promotions/${item.id}`} className="inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-xs font-bold text-white">
                      Ver ficha
                    </Link>
                    {/^https?:\/\//.test(proHref) ? (
                      <a
                        href={proHref}
                        className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)]"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Recibir por SMS/email
                      </a>
                    ) : (
                      <Link href={proHref} className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)]">
                        Recibir por SMS/email
                      </Link>
                    )}
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes sobre alertas Pro" />
        <div className="grid gap-3 md:grid-cols-3">
          {faqs.map((item) => (
            <SurfaceCard key={item.question} className="p-5">
              <h2 className="text-base font-black text-[var(--ink)]">{item.question}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.answer}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </main>
  );
}
