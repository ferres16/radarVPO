import Link from 'next/link';
import { api } from '@/lib/api';
import { MobileNav } from '@/components/mobile-nav';
import { NewsCard } from '@/components/news-card';
import { PromotionCard } from '@/components/promotion-card';

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function getEstimatedFromAlertDate(publishedAt?: string | null) {
  if (!publishedAt) return null;
  const parsed = new Date(publishedAt);
  if (Number.isNaN(parsed.getTime())) return null;
  return addDays(parsed, 60);
}

function getDaysLeft(dateValue?: string | null) {
  if (!dateValue) return null;
  const target = new Date(dateValue).getTime();
  if (Number.isNaN(target)) return null;

  const now = Date.now();
  const msLeft = target - now;
  if (msLeft <= 0) return 0;

  return Math.ceil(msLeft / (1000 * 60 * 60 * 24));
}

export default async function Home() {
  const [upcoming, news] = await Promise.all([
    api.getUpcomingAlerts().catch(() => []),
    api.getNews().catch(() => []),
  ]);

  const recentNews = news.slice(0, 4);
  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell">
        <header className="rounded-3xl border border-[var(--stroke)] bg-white/90 p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green-700)]">Radar VPO</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--ink)] md:text-5xl">
            Proximas promociones, noticias recientes y ayuda para el proceso VPO.
          </h1>
          <p className="mt-3 max-w-xl text-base text-[var(--ink-soft)]">
            Consulta las promociones con alerta activa de 60 dias, revisa las ultimas noticias y contacta con nosotros para acompanarte en cada paso.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--green-700)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]">
              Crear cuenta gratis
            </Link>
            <Link href="/promotions" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Ver todas las promociones
            </Link>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Proximas promociones (alerta 60 dias)</h2>
            <Link href="/dashboard" className="text-sm font-semibold text-[var(--green-700)]">Ver todas</Link>
          </div>
          {upcoming.length === 0 ? (
            <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <p className="text-sm text-[var(--ink-soft)]">No hay alertas activas ahora mismo.</p>
            </article>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.slice(0, 6).map((promotion) => {
                  const estimatedDate = getEstimatedFromAlertDate(
                    promotion.publishedAt,
                  );
                  const daysLeft = estimatedDate
                    ? getDaysLeft(estimatedDate.toISOString())
                    : null;
                  const alertDate = promotion.publishedAt
                    ? promotion.publishedAt.slice(0, 10)
                    : null;
                  return (
                    <div key={promotion.id} className="space-y-2">
                      <PromotionCard promotion={promotion} hideDetail />
                      <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-card">
                        {daysLeft === null ? (
                          'Fecha de alerta sin fecha valida'
                        ) : (
                          <>
                            <div>Publicacion alerta: {alertDate || 'n/d'}</div>
                            <div>
                              Salida estimada: {estimatedDate?.toISOString().slice(0, 10)}
                            </div>
                            <div>Quedan {daysLeft} dias</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-xl font-bold text-[var(--ink)]">Noticias mas recientes</h2>
            <Link href="/dashboard" className="text-sm font-semibold text-[var(--green-700)]">Ver mas noticias</Link>
          </div>
          {recentNews.length === 0 ? (
            <article className="rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
              <p className="text-sm text-[var(--ink-soft)]">Todavia no hay noticias publicadas.</p>
            </article>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recentNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="mt-7 rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <h2 className="text-2xl font-bold text-[var(--ink)]">Tienes dudas o quieres que te ayudemos con el proceso?</h2>
          <p className="mt-2 max-w-2xl text-[var(--ink-soft)]">
            Te ayudamos a entender requisitos, preparar documentacion y seguir los plazos clave para aumentar tus opciones en cada convocatoria.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a href="mailto:soporte@radarvpo.com" className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white hover:bg-[var(--green-700)]">
              Contactar por email
            </a>
            <Link href="/register" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]">
              Quiero acompanamiento
            </Link>
          </div>
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
