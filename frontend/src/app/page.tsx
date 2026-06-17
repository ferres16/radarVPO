import type { Metadata } from 'next';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getDaysRemaining } from '@/lib/alert-countdown';
import { proBenefits, proHref, proPlan, proPlanFeatures, freePlanFeatures } from '@/lib/pro';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { StructuredData } from '@/components/structured-data';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Radar VPO Pro: alertas SMS y curso de vivienda pública',
  description:
    'Activa Radar VPO Pro por 9,99 €/mes y recibe alertas SMS y correo sobre vivienda protegida en Cataluña, con curso de iniciación incluido.',
  path: '/',
  keywords: ['Radar VPO Pro', 'alertas SMS vivienda protegida', 'alertas VPO Cataluña', 'curso vivienda pública'],
});

const faqs = [
  {
    question: '¿Qué incluye Radar VPO Pro?',
    answer:
      'Incluye alertas por SMS, alertas por correo y acceso al curso de iniciación a la vivienda pública para entender requisitos, documentación y errores frecuentes.',
  },
  {
    question: '¿Radar VPO Pro garantiza conseguir una vivienda?',
    answer:
      'No. Radar VPO Pro te ayuda a detectar oportunidades y actuar con más margen, pero la solicitud y adjudicación dependen de los organismos oficiales.',
  },
  {
    question: '¿Puedo usar Radar VPO gratis?',
    answer:
      'Sí. El plan gratis permite consultar promociones y avisos básicos. Pro está pensado para quien quiere avisos directos y formación incluida.',
  },
];

const steps = [
  ['Activa Pro', 'Usa el enlace de Stripe configurado o crea tu cuenta si todavía no estás registrado.'],
  ['Configura tus datos', 'Mantén email y teléfono actualizados para recibir avisos por correo y SMS.'],
  ['Aprende el proceso', `Empieza por el ${proPlan.courseLabel.toLowerCase()} incluido en Pro.`],
  ['Actúa a tiempo', 'Cuando aparezca una oportunidad, recibes una alerta y un siguiente paso claro.'],
];

function CompareCell({ included }: { included: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${included ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
      {included ? 'Incluido' : 'No incluido'}
    </span>
  );
}

export default async function Home() {
  const [alerts, courses, promotions] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=6').catch(() => []),
  ]);

  const activeAlerts = alerts
    .filter((promotion) => promotion.type === 'alert')
    .map((promotion) => ({
      promotion,
      daysRemaining: getDaysRemaining(promotion.estimatedPublicationDate),
    }))
    .slice(0, 3);
  const starterCourse = courses.find((course) => course.accessType === 'pro') || courses.find((course) => course.status === 'published');
  const visiblePromotions = promotions.filter((promotion) => promotion.status !== 'archived').slice(0, 3);

  return (
    <main className="shell space-y-8 pb-16">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqs)]} />
      <PageHero
        eyebrow="Radar VPO Pro"
        title="Alertas SMS y correo para no perder oportunidades de vivienda protegida"
        description={`Por ${proPlan.price}, Radar VPO Pro vigila nuevas oportunidades, te avisa por SMS y correo, e incluye el curso de iniciación para saber qué hacer antes de que cierre el plazo.`}
        tone="green"
        actions={
          <>
            <ButtonLink href={proHref}>Activar Radar VPO Pro</ButtonLink>
            <ButtonLink href="#comparativa" variant="secondary">Comparar Free vs Pro</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Producto principal</p>
          <p className="display-type mt-3 text-4xl font-black text-[var(--ink)]">{proPlan.price}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            Incluye {proPlan.smsLabel.toLowerCase()}, {proPlan.emailLabel.toLowerCase()} y {proPlan.courseLabel.toLowerCase()}.
          </p>
          <div className="mt-5 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-eco)] p-4">
            <p className="text-sm font-bold text-[var(--ink)]">El objetivo no es que entres cada día.</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">El objetivo es que Radar VPO te avise cuando haya algo que puede cambiar tu decisión.</p>
          </div>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-4 md:grid-cols-4">
        {steps.map(([title, copy], index) => (
          <SurfaceCard key={title} className="p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Paso {index + 1}</p>
            <h2 className="mt-3 text-xl font-black text-[var(--ink)]">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{copy}</p>
          </SurfaceCard>
        ))}
      </section>

      <section id="comparativa" className="space-y-4">
        <SectionHeader
          eyebrow="Free vs Pro"
          title="Elige entre consultar cuando puedas o recibir avisos directos"
          description="Free sirve para explorar. Pro está diseñado para usuarios que quieren enterarse antes y entender el proceso."
          action={<ButtonLink href={proHref}>Activar Pro</ButtonLink>}
        />
        <SurfaceCard className="overflow-hidden p-0">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-[var(--stroke)] bg-[var(--bg-app)] text-sm font-black text-[var(--ink)]">
            <div className="p-4">Funcionalidad</div>
            <div className="p-4 text-center">Free</div>
            <div className="p-4 text-center">Pro</div>
          </div>
          {proPlanFeatures.map((feature, index) => (
            <div key={feature.label} className="grid grid-cols-[1.2fr_0.8fr_0.8fr] border-b border-[var(--stroke)] last:border-b-0 text-sm">
              <div className="p-4 font-semibold text-[var(--ink)]">{feature.label}</div>
              <div className="p-4 text-center"><CompareCell included={freePlanFeatures[index]?.included || false} /></div>
              <div className="p-4 text-center"><CompareCell included={feature.included} /></div>
            </div>
          ))}
        </SurfaceCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="Qué incluye Pro" title="Alertas y formación en un solo plan" />
          <div className="mt-4 space-y-3">
            {proBenefits.map((benefit) => (
              <div key={benefit} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 text-sm font-semibold leading-6 text-[var(--ink)]">
                {benefit}
              </div>
            ))}
          </div>
        </SurfaceCard>
        <SurfaceCard className="p-6">
          <SectionHeader eyebrow="Curso incluido" title={starterCourse?.title || proPlan.courseLabel} />
          <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
            Pro incluye un punto de partida para entender requisitos, documentación, plazos y errores habituales antes de presentarte a una convocatoria.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href={starterCourse ? `/cursos/${starterCourse.slug}` : '/cursos'}>Ver curso incluido</ButtonLink>
            <ButtonLink href={proHref} variant="secondary">Activar Pro</ButtonLink>
          </div>
        </SurfaceCard>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Radar activo"
          title="Oportunidades que demuestran por qué conviene tener alertas"
          description="Las promociones y avisos públicos son la prueba del valor; Pro evita depender de revisarlos manualmente."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {activeAlerts.map(({ promotion, daysRemaining }) => (
            <SurfaceCard key={promotion.id} className="p-5">
              <AlertCountdownBadge daysRemaining={daysRemaining} />
              <h3 className="mt-4 text-lg font-black text-[var(--ink)]">{promotion.title}</h3>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Cataluña'}</p>
              <div className="mt-4">
                <ButtonLink href={proHref}>Recibir avisos Pro</ButtonLink>
              </div>
            </SurfaceCard>
          ))}
          {activeAlerts.length === 0
            ? visiblePromotions.map((promotion) => (
                <SurfaceCard key={promotion.id} className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Promoción publicada</p>
                  <h3 className="mt-3 text-lg font-black text-[var(--ink)]">{promotion.title}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.municipality || promotion.location || 'Cataluña'}</p>
                  <Link href={`/promotions/${promotion.id}`} className="mt-4 inline-flex rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-xs font-bold text-[var(--ink)]">
                    Ver ficha
                  </Link>
                </SurfaceCard>
              ))
            : null}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes sobre Radar VPO Pro" />
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
