import Link from 'next/link';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';

export default async function GuiaProPage() {
  const course = await api.getCourse('guia-pro').catch(() => null);

  if (!course) {
    return (
      <main className="shell">
        <ProfileCard>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Guia PRO no disponible</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">Estamos preparando el contenido del curso avanzado.</p>
          <Link
            href="/account"
            className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al perfil
          </Link>
        </ProfileCard>
      </main>
    );
  }

  const modules = course.posts || [];
  const moduleCount = modules.length;
  const resourceCount = modules.reduce((total, module) => total + (module.assets?.length || 0), 0);

  return (
    <main className="shell space-y-6 pb-16">
      <header className="overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-soft)]">Curso avanzado por modulos</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-[var(--ink)] display-type">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              {course.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/curso/guia-pro"
                className="rounded-full bg-[var(--green-500)] px-5 py-3 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
              >
                Ver indice completo
              </Link>
              <Link
                href="/account"
                className="rounded-full border border-[var(--stroke)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
              >
                Volver al perfil
              </Link>
            </div>
          </div>
          <div className="border-t border-[var(--stroke)] bg-[linear-gradient(180deg,var(--bg-app),white)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Modulos</p>
                <p className="mt-2 text-3xl font-black text-[var(--ink)]">{moduleCount}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Contenido organizado para avanzar sin perder contexto.</p>
              </div>
              <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Recursos</p>
                <p className="mt-2 text-3xl font-black text-[var(--ink)]">{resourceCount}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">Archivos, materiales y multimedia asociados a cada modulo.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <ProfileCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Metodo de estudio</p>
          <div className="mt-3 space-y-4 text-sm leading-6 text-[var(--ink-soft)]">
            <p>
              El curso esta pensado como una guia viva: cada modulo funciona como una pagina completa, con texto,
              recursos descargables y materiales visuales.
            </p>
            <p>
              Empieza por el indice, entra en el modulo que te interese y usa los recursos para seguir el recorrido
              paso a paso.
            </p>
          </div>
        </ProfileCard>

        <ProfileCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Indice del curso</p>
          <div className="mt-3 grid gap-3">
            {modules.map((module, index) => (
            <Link
              key={module.id}
              href={`/curso/guia-pro/${module.slug}`}
              className="group rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-4 text-sm text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[var(--green-700)] shadow-sm">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--green-700)]">{module.title}</p>
                  {module.summary ? <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">{module.summary}</p> : null}
                </div>
              </div>
            </Link>
            ))}
          </div>
        </ProfileCard>
      </section>
    </main>
  );
}
