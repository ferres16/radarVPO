import Link from 'next/link';
import { guiaVpoEsencialModules } from '@/content/guia-vpo-esencial';
import { ProfileCard } from '@/components/profile-card';

export default function GuiaVpoEsencialPage() {
  return (
    <main className="shell space-y-6 pb-16">
      <header className="relative overflow-hidden rounded-4xl border border-(--stroke) bg-[linear-gradient(135deg,#f6fbff_0%,#eef6f8_50%,#ffffff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.18)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.14)] blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-(--green-700)">Guia esencial</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black text-(--ink) md:text-5xl display-type">
            Guia VPO esencial
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-(--ink-soft)">
            La ruta esencial para entender la VPO en Cataluna, con un indice claro y acceso rapido a cada modulo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/account#mis-servicios"
              className="inline-flex items-center rounded-full border border-(--stroke) bg-white px-4 py-2 text-sm font-semibold text-(--ink) hover:bg-(--bg-eco)"
            >
              Volver al perfil
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center rounded-full bg-(--green-500) px-4 py-2 text-sm font-semibold text-white hover:bg-(--green-700)"
            >
              Ver asesorias
            </Link>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <ProfileCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--ink-soft)">Indice del curso</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {guiaVpoEsencialModules.map((module) => (
              <Link
                key={module.id}
                href={`/curso/guia-vpo-esencial/${module.id}`}
                className="rounded-2xl border border-(--stroke) bg-(--bg-app) px-4 py-3 text-sm font-semibold text-(--ink) transition hover:-translate-y-0.5 hover:bg-(--bg-eco)"
              >
                {module.title}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-(--ink-soft)">Tip: revisa el registro cada ano para evitar caducidad.</p>
        </ProfileCard>
      </section>
    </main>
  );
}
