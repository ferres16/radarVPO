import Link from 'next/link';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import { ButtonLink, Eyebrow, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';
import { StructuredData } from '@/components/structured-data';
import { createMetadata, faqJsonLd, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Alertas de vivienda protegida en Cataluña',
  description:
    'Recibe antes que nadie nuevas promociones de vivienda protegida en Cataluña. Radar VPO monitoriza promociones, adjudicaciones y próximas publicaciones para que no pierdas oportunidades.',
  path: '/',
  keywords: ['vivienda protegida cataluña', 'alertas vivienda protegida', 'promociones VPO', 'HPO cataluña'],
});

const benefits = [
  'Alertas de nuevas promociones VPO/HPO en Cataluña',
  'Seguimiento de fechas, adjudicaciones y publicaciones oficiales',
  'Cursos prácticos para preparar requisitos y documentación',
];

const trustSignals = [
  { value: '24/7', label: 'monitorización de fuentes públicas' },
  { value: 'VPO/HPO', label: 'foco exclusivo en vivienda protegida' },
  { value: 'Cataluña', label: 'Barcelona, área metropolitana y municipios' },
];

const alertSteps = [
  {
    title: 'Detectamos señales',
    copy: 'Revisamos promociones, avisos municipales, publicaciones y cambios relevantes antes de que el usuario tenga que buscarlos manualmente.',
  },
  {
    title: 'Filtramos lo importante',
    copy: 'Priorizamos oportunidades por municipio, plazos, estado y documentación para separar ruido burocrático de acciones reales.',
  },
  {
    title: 'Te indicamos el siguiente paso',
    copy: 'Cada aviso debe llevarte a registrarte, revisar una promoción, comprar formación o pedir seguimiento experto.',
  },
];

const courseOutcomes = [
  'Entender requisitos de vivienda protegida antes de inscribirte',
  'Preparar documentación sin esperar al último día',
  'Evitar errores frecuentes en solicitudes, sorteos y adjudicaciones',
  'Comparar oportunidades con criterio económico y familiar',
];

const faqs = [
  {
    question: '¿Radar VPO garantiza conseguir una vivienda protegida?',
    answer:
      'No. Radar VPO ayuda a detectar oportunidades, entender requisitos y actuar a tiempo. La adjudicación depende de los organismos oficiales y de cada convocatoria.',
  },
  {
    question: '¿Qué recibo al suscribirme a Alertas VPO?',
    answer:
      'Recibes avisos sobre nuevas promociones, publicaciones próximas, fechas relevantes y cambios que pueden afectar a tu solicitud de vivienda protegida.',
  },
  {
    question: '¿Los cursos sustituyen una asesoría personalizada?',
    answer:
      'No siempre. Los cursos sirven para aprender el proceso y evitar errores comunes; los servicios premium son para revisar casos concretos y acompañamiento individual.',
  },
];

export default async function Home() {
  const [alerts, services, courses, promotions] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.listServices().catch(() => []),
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=10').catch(() => []),
  ]);

  const activeServices = services.filter((service) => service.status === 'active').slice(0, 3);
  const featuredCourses = courses.filter((course) => course.status === 'published').slice(0, 3);
  const publishedPromotions = promotions
    .filter((promotion) => promotion.status !== 'archived')
    .slice(0, 4);
  const activeAlerts = alerts
    .filter((promotion) => promotion.type === 'alert')
    .map((promotion) => {
      const daysRemaining = getDaysRemaining(promotion.estimatedPublicationDate);
      return { promotion, daysRemaining };
    })
    .filter((entry): entry is { promotion: (typeof alerts)[number]; daysRemaining: number } => shouldShowAlert(entry.daysRemaining))
    .slice(0, 3);

  const premiumServices = activeServices.length
    ? activeServices
    : [
        {
          id: 'seguimiento',
          name: 'Seguimiento personalizado',
          description: 'Te ayudamos a vigilar promociones, fechas y requisitos para no perder oportunidades.',
          serviceType: 'premium',
          stripePaymentLink: '/services',
        },
        {
          id: 'asesoria',
          name: 'Asesorías 1:1',
          description: 'Revisamos tu caso, documentación y estrategia antes de cada convocatoria.',
          serviceType: 'premium',
          stripePaymentLink: '/services',
        },
        {
          id: 'alertas',
          name: 'Alertas Pro por WhatsApp',
          description: 'Recibe cambios relevantes por WhatsApp sin revisar portales cada día.',
          serviceType: 'premium',
          stripePaymentLink: '/services',
        },
        {
          id: 'cursos',
          name: 'Cursos prácticos',
          description: 'Aprende requisitos y pasos para presentarte con más ventaja.',
          serviceType: 'formación',
          stripePaymentLink: '/cursos',
        },
      ];

  return (
    <main className="shell space-y-8 pb-16">
      <StructuredData data={[organizationJsonLd(), websiteJsonLd(), faqJsonLd(faqs)]} />
      <PageHero
        eyebrow="Radar VPO Catalunya"
        title="Recibe antes que nadie las nuevas promociones de vivienda protegida en Cataluña"
        description="Radar VPO monitoriza promociones, adjudicaciones y próximas publicaciones para que no pierdas oportunidades de vivienda pública, HPO y VPO."
        tone="green"
        actions={
          <>
            <ButtonLink href="/register?intent=alerts">Suscribirme a Alertas VPO</ButtonLink>
            <ButtonLink href="/promotions" variant="secondary">Ver promociones activas</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Por qué registrarte</p>
          <ul className="mt-4 space-y-3 text-sm font-semibold text-[var(--ink)]">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-2">
                <span aria-hidden="true" className="mt-1 h-2 w-2 rounded-full bg-[var(--green-700)]" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-eco)] p-4">
            <p className="text-sm font-bold text-[var(--ink)]">Objetivo: que actúes antes de que cierre el plazo.</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">Si una promoción aparece tarde en tu radar, ya compites con menos margen.</p>
          </div>
        </SurfaceCard>
      </PageHero>

      <section className="grid gap-3 md:grid-cols-3" aria-label="Indicadores de confianza">
        {trustSignals.map((signal) => (
          <SurfaceCard key={signal.value} className="p-5">
            <p className="display-type text-3xl font-black text-[var(--ink)]">{signal.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{signal.label}</p>
          </SurfaceCard>
        ))}
      </section>

      <section className="space-y-4" id="alertas-vpo">
        <SectionHeader
          eyebrow="Producto principal"
          title="Alertas VPO: deja de revisar portales cada día"
          description="El usuario no paga por información suelta: paga por enterarse a tiempo, entender la prioridad y saber qué hacer después."
          action={<ButtonLink href="/alerts" variant="secondary">Ver cómo funcionan</ButtonLink>}
        />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <SurfaceCard className="p-6">
            <Eyebrow>Cómo funciona</Eyebrow>
            <div className="mt-5 grid gap-3">
              {alertSteps.map((step, index) => (
                <div key={step.title} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Paso {index + 1}</p>
                  <h3 className="mt-2 text-lg font-black text-[var(--ink)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{step.copy}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Qué recibes</p>
            <h3 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">Alertas accionables, no newsletters genéricas</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Frecuencia variable según actividad del mercado: nuevas promociones, aperturas próximas, cambios de estado y recordatorios de documentación.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href="/register?intent=alerts">Activar alertas</ButtonLink>
              <ButtonLink href="/services" variant="secondary">Quiero seguimiento premium</ButtonLink>
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Cursos"
          title="Aprende el proceso antes de que una convocatoria te obligue a improvisar"
          description="Los cursos convierten vivienda protegida, requisitos y documentación en un sistema práctico para tomar mejores decisiones."
          action={<ButtonLink href="/cursos" variant="secondary">Ver cursos</ButtonLink>}
        />
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <SurfaceCard className="p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">Resultados</p>
            <h3 className="display-type mt-3 text-3xl font-black text-[var(--ink)]">Formación premium orientada a acción</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--ink-soft)]">
              {courseOutcomes.map((outcome) => (
                <li key={outcome} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">{outcome}</li>
              ))}
            </ul>
          </SurfaceCard>
          {featuredCourses.length === 0 ? (
            <SurfaceCard className="p-6">
              <h3 className="display-type text-2xl font-black text-[var(--ink)]">Los cursos publicados aparecerán aquí</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">Mientras tanto, puedes activar alertas o solicitar seguimiento para tu caso.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/register?intent=alerts">Activar alertas</ButtonLink>
                <ButtonLink href="/services" variant="secondary">Pedir asesoría</ButtonLink>
              </div>
            </SurfaceCard>
          ) : (
            <Stagger className="grid gap-4 md:grid-cols-2">
              {featuredCourses.slice(0, 2).map((course) => (
                <StaggerItem key={course.id}>
                  <SurfaceCard className="h-full p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">{course.accessType}</p>
                    <h3 className="display-type mt-3 text-xl font-black text-[var(--ink)]">{course.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{course.shortDescription || 'Curso práctico para avanzar con más seguridad.'}</p>
                    <div className="mt-5">
                      <ButtonLink href={`/cursos/${course.slug}`}>Ver temario y precio</ButtonLink>
                    </div>
                  </SurfaceCard>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Promociones activas"
          title="Inventario real para revisar ahora"
          description="Las promociones dan prueba del valor del radar, pero el objetivo es que el usuario no dependa de entrar cada día."
          action={<ButtonLink href="/promotions" variant="secondary">Ver todas</ButtonLink>}
        />
        {publishedPromotions.length === 0 ? (
          <SurfaceCard className="p-6 text-center">
            <h3 className="display-type text-2xl font-black text-[var(--ink)]">No hay promociones destacadas ahora mismo</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Activa alertas para enterarte cuando aparezcan nuevas oportunidades.</p>
            <div className="mt-5 flex justify-center gap-3">
              <ButtonLink href="/register?intent=alerts">Activar alertas</ButtonLink>
              <ButtonLink href="/services" variant="secondary">Seguimiento premium</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {publishedPromotions.map((promotion, index) => (
              <StaggerItem key={promotion.id}>
                <MotionCard className="ds-card h-full overflow-hidden">
                  <div className="h-36 bg-[linear-gradient(135deg,rgba(22,112,85,0.18),rgba(244,197,66,0.18),rgba(54,189,248,0.12))] p-4">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[var(--green-700)]">#{index + 1} reciente</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</p>
                    <h3 className="mt-2 line-clamp-2 text-base font-black text-[var(--ink)]">{promotion.title}</h3>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.promotionType} · {promotion.publishedAt?.slice(0, 10) || 'Fecha por confirmar'}</p>
                    <Link href={`/promotions/${promotion.id}`} className="mt-4 inline-flex rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-bold text-white">Ver detalles</Link>
                  </div>
                </MotionCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Servicios Premium"
          title="Cuando quieres acompañamiento, no solo información"
          description="Seguimiento individualizado, asesorías y alertas Pro para usuarios que quieren reducir incertidumbre y ahorrar tiempo."
          action={<ButtonLink href="/services" variant="secondary">Ver servicios</ButtonLink>}
        />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {premiumServices.slice(0, 3).map((service) => (
            <StaggerItem key={service.id}>
              <SurfaceCard className="h-full p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">{service.serviceType}</p>
                <h3 className="display-type mt-3 text-2xl font-black text-[var(--ink)]">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.description}</p>
                <div className="mt-5">
                  <ButtonLink href={service.stripePaymentLink || '/services'}>Contratar o consultar</ButtonLink>
                </div>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Avisos recientes"
          title="Lo urgente que deberías vigilar"
          action={<ButtonLink href="/alerts" variant="secondary">Ver avisos</ButtonLink>}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {activeAlerts.length === 0 ? (
            <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)] md:col-span-3">No hay avisos críticos ahora mismo. Regístrate para recibir los próximos.</SurfaceCard>
          ) : activeAlerts.map(({ promotion, daysRemaining }) => (
            <MotionCard key={promotion.id} className="ds-card p-4">
              <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
              <p className="mt-4 text-sm font-bold leading-6 text-[var(--ink)]">{promotion.title}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</p>
              <Link href="/register?intent=alerts" className="mt-4 inline-flex rounded-full bg-[var(--ink)] px-4 py-2 text-xs font-bold text-white">Recibir alertas similares</Link>
            </MotionCard>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--stroke)] bg-[var(--ink)] p-6 text-white md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Siguiente paso</p>
        <h2 className="display-type mt-3 max-w-3xl text-3xl font-black md:text-4xl">No esperes a descubrir una promoción cuando el plazo ya está corriendo.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">Crea tu cuenta, activa Alertas VPO y usa cursos o seguimiento premium cuando necesites ir con más seguridad.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/register?intent=alerts">Crear cuenta gratis</ButtonLink>
          <ButtonLink href="/cursos" variant="secondary">Ver cursos</ButtonLink>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader eyebrow="FAQ" title="Preguntas frecuentes sobre Radar VPO" />
        <div className="grid gap-3 md:grid-cols-3">
          {faqs.map((item) => (
            <SurfaceCard key={item.question} className="p-5">
              <h3 className="text-base font-black text-[var(--ink)]">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{item.answer}</p>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </main>
  );
}
