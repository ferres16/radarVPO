import Link from 'next/link';
import { api } from '@/lib/api';
import { NewsCard } from '@/components/news-card';
import { AlertCountdownBadge } from '@/components/alert-countdown-badge';
import { getDaysRemaining, shouldShowAlert } from '@/lib/alert-countdown';
import { ButtonLink, MetricCard, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { MotionCard, Stagger, StaggerItem } from '@/components/motion-primitives';

export default async function Home() {
  const [alerts, news, services, courses, promotions] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
    api.listServices().catch(() => []),
    api.listCourses().catch(() => []),
    api.getPromotions('?limit=6').catch(() => []),
  ]);

  const latestNews = news.slice(0, 3);
  const activeServices = services.filter((service) => service.status === 'active').slice(0, 3);
  const featuredCourses = courses.filter((course) => course.status === 'published').slice(0, 3);
  const publishedPromotions = promotions.filter((promotion) => promotion.type === 'published').slice(0, 3);
  const activeAlerts = alerts
    .filter((promotion) => promotion.type === 'alert')
    .map((promotion) => {
      const daysRemaining = getDaysRemaining(promotion.estimatedPublicationDate);
      return { promotion, daysRemaining };
    })
    .filter((entry): entry is { promotion: (typeof alerts)[number]; daysRemaining: number } => shouldShowAlert(entry.daysRemaining))
    .slice(0, 3);

  const stats = [
    { value: publishedPromotions.length, label: 'Promociones destacadas', detail: 'Publicadas y listas para revisar.' },
    { value: activeAlerts.length, label: 'Alertas visibles', detail: 'Fechas y oportunidades próximas.' },
    { value: activeServices.length || services.length, label: 'Servicios', detail: 'Asesoría, alertas y formación.' },
  ];

  return (
    <main className="shell space-y-8 pb-16">
      <PageHero
        eyebrow="Portal moderno de vivienda pública"
        title="Servicios, promociones, alertas y cursos para decidir con claridad"
        description="Radar VPO centraliza oportunidades de vivienda pública en Cataluña, formación práctica y seguimiento para que cada usuario encuentre rápido su siguiente paso."
        tone="red"
        actions={
          <>
            <ButtonLink href="/promotions">Ver promociones</ButtonLink>
            <ButtonLink href="/services" variant="secondary">Explorar servicios</ButtonLink>
          </>
        }
      >
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <MetricCard key={stat.label} label={stat.label} value={stat.value} detail={stat.detail} />
          ))}
        </div>
      </PageHero>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Servicios disponibles"
          title="Acompañamiento, alertas y formación en una misma ruta"
          description="Los servicios son el punto de entrada para convertir información dispersa en decisiones accionables."
          action={<ButtonLink href="/services" variant="secondary">Ver servicios</ButtonLink>}
        />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {(activeServices.length ? activeServices : services.slice(0, 3)).map((service) => (
            <StaggerItem key={service.id}>
              <SurfaceCard className="h-full p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">{service.serviceType}</p>
                <h3 className="display-type mt-3 text-2xl font-black text-[var(--ink)]">{service.name}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{service.description || 'Servicio gestionado desde el panel de administración.'}</p>
                <div className="mt-5">
                  <ButtonLink href={service.stripePaymentLink || '/services'}>Activar</ButtonLink>
                </div>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4">
          <SectionHeader
            eyebrow="Promociones activas"
            title="Viviendas publicadas para comparar"
            action={<ButtonLink href="/promotions" variant="secondary">Buscar vivienda</ButtonLink>}
          />
          <div className="grid gap-3">
            {publishedPromotions.length === 0 ? (
              <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">No hay promociones publicadas destacadas ahora mismo.</SurfaceCard>
            ) : (
              publishedPromotions.map((promotion) => (
                <MotionCard key={promotion.id} className="ds-card p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-[var(--ink)]">{promotion.title}</p>
                      <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'} · {promotion.promotionType}</p>
                    </div>
                    <Link href={`/promotions/${promotion.id}`} className="text-sm font-bold text-[var(--green-700)]">Ver ficha</Link>
                  </div>
                </MotionCard>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <SectionHeader
            eyebrow="Centro de alertas"
            title="Fechas críticas y nuevas oportunidades"
            action={<ButtonLink href="/alerts" variant="secondary">Ver alertas</ButtonLink>}
          />
          <div className="grid gap-3">
            {activeAlerts.length === 0 ? (
              <SurfaceCard className="p-5 text-sm text-[var(--ink-soft)]">No hay alertas activas en la ventana actual.</SurfaceCard>
            ) : (
              activeAlerts.map(({ promotion, daysRemaining }) => (
                <MotionCard key={promotion.id} className="ds-card p-4">
                  <AlertCountdownBadge daysRemaining={daysRemaining} size="sm" />
                  <p className="mt-4 text-sm font-bold leading-6 text-[var(--ink)]">{promotion.title}</p>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.municipality || 'Catalunya'}</p>
                </MotionCard>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Cursos y formación"
          title="Aprende los requisitos antes de presentar tu solicitud"
          description="Cursos vivos, guías y contenidos estructurados para preparar documentación, criterios económicos y pasos de inscripción."
          action={<ButtonLink href="/cursos" variant="secondary">Ver cursos</ButtonLink>}
        />
        <Stagger className="grid gap-4 md:grid-cols-3">
          {featuredCourses.map((course) => (
            <StaggerItem key={course.id}>
              <SurfaceCard className="h-full p-5">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--cyan-700)]">{course.accessType}</p>
                <h3 className="display-type mt-3 text-xl font-black text-[var(--ink)]">{course.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">{course.shortDescription || 'Curso con contenido modular gestionado desde el CMS.'}</p>
                <div className="mt-5">
                  <ButtonLink href={`/cursos/${course.slug}`} variant="secondary">Abrir curso</ButtonLink>
                </div>
              </SurfaceCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="space-y-4">
        <SectionHeader
          eyebrow="Últimas novedades"
          title="Cambios normativos y noticias útiles"
          action={<ButtonLink href="/news" variant="secondary">Ver noticias</ButtonLink>}
        />
        {latestNews.length === 0 ? (
          <SurfaceCard className="p-5 text-center text-sm text-[var(--ink-soft)]">Cuando publiquemos novedades relevantes de vivienda aparecerán aquí.</SurfaceCard>
        ) : (
          <Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {latestNews.map((item) => (
              <StaggerItem key={item.id}>
                <NewsCard item={item} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </section>
    </main>
  );
}
