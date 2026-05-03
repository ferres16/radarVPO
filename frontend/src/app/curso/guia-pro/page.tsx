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

  return (
    <main className="shell space-y-6 pb-16">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Guia PRO</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--ink)] display-type">{course.title}</h1>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/account"
            className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
          >
            Volver al perfil
          </Link>
        </div>
      </header>

      <ProfileCard>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Indice del curso</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(course.posts || []).map((module) => (
            <Link
              key={module.id}
              href={`/curso/guia-pro/${module.slug}`}
              className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]"
            >
              <p className="text-sm font-semibold text-[var(--ink)]">{module.title}</p>
              {module.summary ? <p className="mt-1 text-xs text-[var(--ink-soft)]">{module.summary}</p> : null}
            </Link>
          ))}
        </div>
      </ProfileCard>
    </main>
  );
}
