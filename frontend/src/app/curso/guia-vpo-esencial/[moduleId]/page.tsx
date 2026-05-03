import Link from 'next/link';
import { guiaVpoEsencialModules } from '@/content/guia-vpo-esencial';
import { ProfileCard } from '@/components/profile-card';

const blockStyles = {
  paragraph: 'text-sm leading-6 text-[var(--ink-soft)]',
  list: 'mt-3 space-y-2 text-sm text-[var(--ink-soft)]',
  callout:
    'rounded-2xl border border-[rgba(54,189,248,0.35)] bg-[rgba(54,189,248,0.12)] p-4 text-sm text-[var(--ink)]',
  steps: 'mt-3 space-y-2 text-sm text-[var(--ink-soft)]',
};

type PageProps = {
  params: { moduleId: string };
};

export default function GuiaVpoEsencialModulePage({ params }: PageProps) {
  const module = guiaVpoEsencialModules.find((item) => item.id === params.moduleId);

  if (!module) {
    return (
      <main className="shell">
        <ProfileCard>
          <h1 className="text-2xl font-bold text-[var(--ink)]">Modulo no encontrado</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">El modulo que buscas no existe o fue movido.</p>
          <Link
            href="/curso/guia-vpo-esencial"
            className="mt-4 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al indice
          </Link>
        </ProfileCard>
      </main>
    );
  }

  return (
    <main className="shell space-y-6 pb-16">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Guia esencial</p>
        <h1 className="mt-2 text-3xl font-black text-[var(--ink)] display-type">{module.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/curso/guia-vpo-esencial"
            className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
          >
            Volver al indice
          </Link>
          <Link
            href="/account#mis-servicios"
            className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
          >
            Ir a mi cuenta
          </Link>
        </div>
      </header>

      <ProfileCard>
        <div className="flex flex-wrap gap-2">
          {guiaVpoEsencialModules.map((item) => (
            <Link
              key={item.id}
              href={`/curso/guia-vpo-esencial/${item.id}`}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                item.id === module.id
                  ? 'border-[var(--green-500)] bg-[var(--bg-eco)] text-[var(--green-700)]'
                  : 'border-[var(--stroke)] bg-white text-[var(--ink)] hover:bg-[var(--bg-eco)]'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </ProfileCard>

      <ProfileCard className="space-y-3">
        {module.blocks.map((block, index) => {
          if (block.type === 'paragraph') {
            return (
              <p key={`${module.id}-p-${index}`} className={blockStyles.paragraph}>
                {block.text}
              </p>
            );
          }

          if (block.type === 'list') {
            return (
              <ul key={`${module.id}-l-${index}`} className={blockStyles.list}>
                {block.items.map((item) => (
                  <li key={item} className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === 'steps') {
            return (
              <ol key={`${module.id}-s-${index}`} className={blockStyles.steps}>
                {block.steps.map((step, stepIndex) => (
                  <li key={step} className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2">
                    <span className="mr-2 text-xs font-semibold text-[var(--green-700)]">Paso {stepIndex + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            );
          }

          return (
            <div key={`${module.id}-c-${index}`} className={blockStyles.callout}>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">
                {block.title}
              </p>
              <p className="mt-2 text-sm text-[var(--ink)]">{block.text}</p>
            </div>
          );
        })}
      </ProfileCard>
    </main>
  );
}
