import Link from 'next/link';
import { MobileNav } from '@/components/mobile-nav';

export default function Home() {
  return (
    <div className="hero-bg min-h-screen pb-20 md:pb-0">
      <main className="shell">
        <header className="rounded-3xl border border-[var(--stroke)] bg-white/90 p-6 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--green-700)]">Radar VPO</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[var(--ink)] md:text-5xl">
            Promociones de vivienda protegida y alertas futuras en Catalunya.
          </h1>
          <p className="mt-3 max-w-xl text-base text-[var(--ink-soft)]">
            Descubre convocatorias oficiales, novedades y fechas clave para no perder oportunidades de VPO/HPO.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white transition hover:bg-[var(--green-700)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)]">
              Crear cuenta gratis
            </Link>
            <Link href="/dashboard" className="rounded-xl border border-[var(--stroke)] bg-white px-5 py-3 font-semibold text-[var(--ink)] transition hover:bg-[var(--bg-eco)]">
              Explorar dashboard
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Promociones VPO', 'Fuentes oficiales normalizadas y filtrables por municipio y estado.'],
            ['Alertas upcoming', 'Deteccion de publicaciones futuras y timeline de seguimiento.'],
            ['Noticias relevantes', 'Resumen claro de noticias de vivienda publica sin ruido ni spam.'],
          ].map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <h2 className="text-lg font-bold text-[var(--ink)]">{title}</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">{description}</p>
            </article>
          ))}
        </section>
      </main>
      <MobileNav />
    </div>
  );
}
