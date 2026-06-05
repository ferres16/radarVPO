import Link from 'next/link';
import { api } from '@/lib/api';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';

export default async function Home() {
  const [alerts, services, courses, promotions] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.listServices().catch(() => []),
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=6').catch(() => []),
  ]);

  const activeServices = services.filter((service) => service.status === 'active').slice(0, 3);
  const featuredCourses = courses.filter((course) => course.status === 'published').slice(0, 3);
  const publishedPromotions = promotions.filter((promotion) => promotion.type === 'published').slice(0, 4);
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
          name: 'Asesoría 1:1',
          description: 'Revisamos tu caso, documentación y estrategia antes de cada convocatoria.',
          serviceType: 'premium',
          stripePaymentLink: '/services',
        },
        {
          id: 'alertas',
          name: 'Avisos prioritarios',
          description: 'Recibe cambios relevantes y próximas aperturas sin revisar portales cada día.',
          serviceType: 'premium',
          stripePaymentLink: '/services',
        },
      ];

  const courseBenefits = [
    'Entender requisitos antes de inscribirte',
    'Preparar documentación sin improvisar',
    'Evitar errores que te dejan fuera',
  ];

  return (
    <main className="shell space-y-8 pb-16">
      <PageHero
        eyebrow="Radar VPO Catalunya"
        title="Encuentra oportunidades de vivienda pública antes que nadie"
        description="Promociones, avisos, formación y asesoramiento especializado para acceder a vivienda protegida en Cataluña."
        tone="red"
        actions={
          <>
            <ButtonLink href="/promotions">Ver promociones</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Explorar servicios</ButtonLink>
          </>
        }
      >
        <SurfaceCard className="p-5">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Ruta recomendada</p>
          <ol className="mt-4 space-y-3 text-sm font-semibold text-[var(--ink)]">
            <li>1. Mira las promociones publicadas.</li>
            <li>2. Activa avisos para próximas aperturas.</li>
            <li>3. Contrata ayuda si quieres ir con ventaja.</li>
          </ol>
        </SurfaceCard>
      </PageHero>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Últimas promociones"
          title="Oportunidades recientes para revisar ahora"
          description="Máximo 4 fichas destacadas para que la Home no se convierta en un listado interminable."
          action={<ButtonLink href="/promotions" variant="secondary">Ver todas</ButtonLink>}
        />
        {publishedPromotions.length === 0 ? (
          <SurfaceCard className="p-6 text-center">
            <h3 className="display-type text-2xl font-black text-[var(--ink)]">No hay promociones destacadas ahora mismo</h3>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Consulta avisos o explora servicios para activar seguimiento.</p>
            <div className="mt-5 flex justify-center gap-3">
              <ButtonLink href="/alerts">Ver avisos</ButtonLink>
              <ButtonLink href="/services" variant="secondary">Servicios</ButtonLink>
            </div>
          </SurfaceCard>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {publishedPromotions.map((promotion, index) => (
              <StaggerItem key={promotion.id}>
                <MotionCard className="ds-card h-full overflow-hidden">
                  <div className="h-36 bg-[linear-gradient(135deg,rgba(22,112,85,0.18),rgba(244,197,66,0.18),rgba(167,28,32,0.10))] p-4">
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
          title="Paga por ahorrar tiempo, reducir errores y llegar antes"
          description="No vendemos información genérica: ayudamos a vigilar oportunidades, entender requisitos y preparar el proceso con criterio."
          action={<ButtonLink href="/services" variant="secondary">Ver planes</ButtonLink>}
        />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {premiumServices.map((service) => (
            <StaggerItem key={service.id}>
              <SurfaceCard className="h-full p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">{service.serviceType}</p>
                <h3 className="display-type mt-3 text-2xl font-black text-[var(--ink)]">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.description}</p>
                <div className="mt-5">
                  <ButtonLink href={service.stripePaymentLink || '/services'}>Contratar</ButtonLink>
                </div>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Cursos"
          title="Formación para conseguir ventajas reales"
          description="Cursos orientados a resultados: entender requisitos, preparar documentación y evitar errores antes de presentar una solicitud."
          action={<ButtonLink href="/cursos" variant="secondary">Ver cursos</ButtonLink>}
        />
        {featuredCourses.length === 0 ? (
          <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">Los cursos publicados aparecerán aquí.</SurfaceCard>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredCourses.map((course) => (
              <StaggerItem key={course.id}>
                <SurfaceCard className="h-full p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">{course.accessType}</p>
                  <h3 className="display-type mt-3 text-xl font-black text-[var(--ink)]">{course.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                    {courseBenefits.map((benefit) => <li key={benefit}>• {benefit}</li>)}
                  </ul>
                  <div className="mt-5">
                    <ButtonLink href={`/cursos/${course.slug}`}>Ver curso</ButtonLink>
                  </div>
                </SurfaceCard>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Avisos recientes"
          title="Lo importante que debes vigilar"
          action={<ButtonLink href="/alerts" variant="secondary">Ver avisos</ButtonLink>}
        />
        <div className="grid gap-3 md:grid-cols-3">
          {activeAlerts.length === 0 ? (
            <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)] md:col-span-3">No hay avisos críticos ahora mismo.</SurfaceCard>
          ) : activeAlerts.map(({ promotion, daysRemaining }) => (
            <MotionCard key={promotion.id} className="ds-card p-4">
              <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
              <p className="mt-4 text-sm font-bold leading-6 text-[var(--ink)]">{promotion.title}</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</p>
            </MotionCard>
          ))}
        </div>
      </section>
    </main>
  );
}
