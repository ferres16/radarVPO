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
          <h1 className="text-2xl font-bold text-(--ink)">Modulo no disponible</h1>
          <p className="mt-2 text-sm text-(--ink-soft)">No encontramos el modulo solicitado.</p>
          <Link
            href="/curso/guia-pro"
            className="mt-4 inline-flex rounded-xl bg-(--green-500) px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al indice
          </Link>
        </ProfileCard>
      </main>
    );
  }

  const { course, module } = response;
  const modules = course.posts || [];

  return (
    <main className="shell space-y-6 pb-16">
      <header className="overflow-hidden rounded-4xl border border-(--stroke) bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-(--ink-soft)">{course.title}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-(--ink) display-type">{module.title}</h1>
            {module.summary ? <p className="mt-4 max-w-3xl text-sm leading-6 text-(--ink-soft)">{module.summary}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/curso/guia-pro"
                className="rounded-full border border-(--stroke) bg-white px-5 py-3 text-sm font-semibold text-(--ink) hover:bg-(--bg-eco)"
              >
                Volver al indice
              </Link>
              <Link
                href="/account"
                className="rounded-full bg-(--green-500) px-5 py-3 text-sm font-semibold text-white hover:bg-(--green-700)"
              >
                Ir a mi cuenta
              </Link>
            </div>
          </div>
          <div className="border-t border-(--stroke) bg-[linear-gradient(180deg,var(--bg-app),white)] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--ink-soft)">Contenido del modulo</p>
            <div className="mt-4 space-y-3 text-sm text-(--ink-soft)">
              <div className="rounded-2xl border border-(--stroke) bg-white p-4">
                <p className="font-semibold text-(--ink)">Lectura guiada</p>
                <p className="mt-1">Lee el contenido completo y sigue el orden natural del modulo.</p>
              </div>
              <div className="rounded-2xl border border-(--stroke) bg-white p-4">
                <p className="font-semibold text-(--ink)">Material de apoyo</p>
                <p className="mt-1">Descarga recursos, revisa imagenes o abre videos asociados.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <ProfileCard>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--ink-soft)">Siguiente pasos</p>
          <div className="mt-3 space-y-2">
            {modules.map((item) => (
              <Link
                key={item.id}
                href={`/curso/guia-pro/${item.slug}`}
                className={`block rounded-2xl border px-4 py-3 text-sm transition ${
                  item.id === module.id
                    ? 'border-(--green-500) bg-(--bg-eco) font-semibold text-(--ink)'
                    : 'border-(--stroke) bg-(--bg-app) text-(--ink) hover:bg-(--bg-eco)'
                }`}
              >
                <p className="font-semibold">{item.title}</p>
                {item.summary ? <p className="mt-1 text-xs text-(--ink-soft)">{item.summary}</p> : null}
              </Link>
            ))}
          </div>
        </ProfileCard>

        <ProfileCard>
          <div className="prose max-w-none text-sm text-(--ink)">
            {module.body.split('\n').map((paragraph, index) => (
              <p key={`${module.id}-p-${index}`} className="text-sm leading-7 text-(--ink-soft)">
                {paragraph}
              </p>
            ))}
          </div>
        </ProfileCard>
      </section>

      {module.assets && module.assets.length > 0 ? (
        <ProfileCard>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--ink-soft)">Recursos</p>
              <h2 className="mt-2 text-xl font-bold text-(--ink)">Material asociado al modulo</h2>
            </div>
            <p className="text-xs text-(--ink-soft)">{module.assets.length} recursos disponibles</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {module.assets.map((asset) => (
              <a
                key={asset.id}
                href={asset.publicUrl}
                className="group rounded-2xl border border-(--stroke) bg-(--bg-app) p-4 text-sm transition hover:-translate-y-0.5 hover:bg-(--bg-eco)"
              >
                <p className="font-semibold text-(--ink) group-hover:text-(--green-700)">
                  {asset.originalName || 'Recurso'}
                </p>
                <p className="mt-1 text-xs text-(--ink-soft)">Abrir material adjunto</p>
              </a>
            ))}
          </div>
        </ProfileCard>
      ) : null}
    </main>
  );
}
