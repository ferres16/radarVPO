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

export default function GuiaVpoEsencialPage() {
  return (
    <main className="shell space-y-6 pb-16">
      <header className="relative overflow-hidden rounded-[2rem] border border-[var(--stroke)] bg-[linear-gradient(135deg,#f6fbff_0%,#eef6f8_50%,#ffffff_100%)] p-6 shadow-card md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[rgba(54,189,248,0.18)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[rgba(47,107,36,0.14)] blur-3xl" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Guia esencial</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black text-[var(--ink)] md:text-5xl display-type">
            Curso VPO en Cataluna, paso a paso
          </h1>
          <p className="mt-3 max-w-3xl text-sm text-[var(--ink-soft)]">
            Navega por los modulos, guarda tu progreso y prepara tu carpeta VPO con tiempo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/account#mis-servicios"
              className="inline-flex items-center rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
            >
              Volver al perfil
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]"
            >
              Mejorar a PRO
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[260px,1fr]">
        <ProfileCard className="sticky top-24 h-fit space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Contenido</p>
          <nav className="space-y-2">
            {guiaVpoEsencialModules.map((module) => (
              <a
                key={module.id}
                href={`#${module.id}`}
                className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
              >
                {module.title}
              </a>
            ))}
          </nav>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-xs text-[var(--ink-soft)]">
            Tip: revisa el registro cada ano para evitar caducidad.
          </div>
        </ProfileCard>

        <div className="space-y-4">
          {guiaVpoEsencialModules.map((module) => (
            <ProfileCard key={module.id} className="space-y-3">
              <div id={module.id}>
                <h2 className="text-xl font-bold text-[var(--ink)]">{module.title}</h2>
                <div className="mt-3 space-y-3">
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
                </div>
              </div>
            </ProfileCard>
          ))}
        </div>
      </section>
    </main>
  );
}
