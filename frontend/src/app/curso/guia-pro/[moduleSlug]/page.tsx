import Link from 'next/link';
import { api } from '@/lib/api';
import { ProfileCard } from '@/components/profile-card';

type PageProps = {
  params: { moduleSlug: string };
};

export default async function GuiaProModulePage({ params }: PageProps) {
  const response = await api.getCourseModule('guia-pro', params.moduleSlug).catch(() => null);

  if (!response) {
    return (
      <main className="shell">
        <ProfileCard>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Modulo no disponible</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">No encontramos el modulo solicitado.</p>
          <Link
            href="/curso/guia-pro"
            className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al indice
          </Link>
        </ProfileCard>
      </main>
    );
  }

  const { course, module } = response;

  return (
    <main className="shell space-y-6 pb-16">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">{course.title}</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--ink)] display-type">{module.title}</h1>
        {module.summary ? <p className="mt-2 text-sm text-[var(--ink-soft)]">{module.summary}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/curso/guia-pro"
            className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
          >
            Volver al indice
          </Link>
          <Link
            href="/account"
            className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
          >
            Ir a mi cuenta
          </Link>
        </div>
      </header>

      <ProfileCard>
        <div className="prose max-w-none text-sm text-[var(--ink)]">
          {module.body.split('\n').map((paragraph, index) => (
            <p key={`${module.id}-p-${index}`} className="text-sm leading-6 text-[var(--ink-soft)]">
              {paragraph}
            </p>
          ))}
        </div>
      </ProfileCard>

      {module.assets && module.assets.length > 0 ? (
        <ProfileCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Recursos</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {module.assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.publicUrl}
                className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                {asset.originalName || asset.publicUrl}
              </a>
            ))}
          </div>
        </ProfileCard>
      ) : null}
    </main>
  );
}
