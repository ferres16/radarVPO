import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata, faqJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Alertas VPO en Cataluña',
  description:
    'Activa alertas de vivienda protegida para recibir avisos de nuevas promociones, próximas publicaciones, adjudicaciones y cambios importantes en Cataluña.',
  path: '/alerts',
  keywords: ['alertas vivienda protegida', 'promociones VPO', 'adjudicaciones vivienda protegida'],
});

const benefits = [
  {
    title: 'Menos búsqueda manual',
    copy: 'Dejas de revisar portales y webs municipales cada día para saber si hay novedades.',
  },
  {
    title: 'Más margen de reacción',
    copy: 'Los avisos priorizan fechas y ventanas de publicación para preparar documentación antes.',
  },
  {
    title: 'Siguiente paso claro',
    copy: 'Cada alerta debe llevarte a revisar ficha, registrarte o contratar seguimiento si necesitas ayuda.',
  },
];

const faqs = [
  {
    question: '¿Cada cuánto se envían las Alertas VPO?',
    answer: 'La frecuencia depende de la actividad detectada: nuevas promociones, cambios de estado, fechas próximas y publicaciones oficiales.',
  },
  {
    question: '¿Puedo usar alertas gratis?',
    answer: 'El registro permite centralizar el perfil y recibir comunicaciones básicas. Las alertas avanzadas y seguimiento pueden formar parte de planes premium.',
  },
  {
    question: '¿Las alertas sustituyen la fuente oficial?',
    answer: 'No. Radar VPO ayuda a detectar y priorizar oportunidades, pero la solicitud y adjudicación dependen de la fuente oficial de cada promoción.',
  },
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
        eyebrow="Alertas VPO"
        title="Recibe avisos antes de que una oportunidad se te escape"
        description="Monitorizamos promociones, próximas publicaciones y cambios relevantes para que sepas cuándo actuar y qué preparar."
        actions={
          <>
            <ButtonLink href="/register?intent=alerts">Suscribirme a Alertas VPO</ButtonLink>
            <ButtonLink href="/promotions" variant="secondary">Ver promociones activas</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Qué incluye</p>
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Nuevas promociones VPO/HPO, publicaciones próximas, fechas críticas, cambios de estado y oportunidades que requieren preparación.
          </p>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-3">
        {benefits.map((benefit) => (
          <SurfaceCard key={benefit.title} className="p-5">
            <h2 className="display-type text-2xl font-black text-[var(--ink)]">{benefit.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{benefit.copy}</p>
          </SurfaceCard>
        ))}
      </section>

      {activeAlerts.length === 0 ? (
        <SurfaceCard className="p-8 text-center">
          <EmptyState title="Sin avisos activos" description="Ahora mismo no hay avisos dentro de la ventana de visibilidad." />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            El momento crítico es el próximo aviso. Regístrate para que Radar VPO te ayude a detectarlo sin entrar cada día.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/register?intent=alerts">Crear alerta</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Contratar seguimiento</ButtonLink>
          </div>
        </SurfaceCard>
      ) : (
        <section className="space-y-4">
          <SectionHeader
            eyebrow="Avisos activos"
            title="Oportunidades que conviene vigilar ahora"
            description="Cada tarjeta debe ayudarte a decidir si revisar ficha, activar alertas o pedir acompañamiento."
          />
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {activeAlerts.map(({ item, daysRemaining }) => (
              <StaggerItem key={item.id}>
                <MotionCard className="ds-card h-full p-5">
                  <div className="flex items-start justify-between gap-3">
                    <AlertCountdownBadge daysRemaining={daysRemaining} size="lg" />
                    <span className="rounded-full bg-[var(--bg-eco)] px-3 py-1 text-xs font-bold text-[var(--green-700)]">
                      Aviso activo
                    </span>
                  </div>
                  <p className="mt-4 text-base font-bold leading-6 text-[var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{item.municipality || 'Catalunya'}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/promotions/${item.id}`} className="inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-xs font-bold text-white">
                      Ver ficha
                    </Link>
                    <Link href="/register?intent=alerts" className="inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)]">
                      Recibir alertas
                    </Link>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <SurfaceCard className="p-6">
          <SectionHeader
            eyebrow="Frecuencia"
            title="Las alertas se envían cuando hay algo que puede cambiar tu decisión"
            description="No se trata de llenar tu correo: se trata de avisarte cuando aparece una nueva promoción, se acerca una publicación o cambia un dato relevante."
          />
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="Premium" title="¿Quieres que alguien lo vigile contigo?" />
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            El seguimiento premium está pensado para usuarios que quieren interpretación de requisitos, recordatorios y apoyo para priorizar oportunidades.
          </p>
          <div className="mt-5">
            <ButtonLink href="/services">Ver servicios premium</ButtonLink>
          </div>
        </SurfaceCard>
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes sobre Alertas VPO" />
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
