import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { GUIDE_SAMPLE_PAGES } from '@/lib/guide-sample-pages';
import { GUIDE_VPO_TAGLINE } from '@/lib/guide-vpo';

/** Muestra real gratuita: portada + páginas desarrolladas (sin cuenta). */
export function GuideSample({
  slug,
  coverSrc,
  title,
  payHref = '#pagar',
}: {
  slug: string;
  coverSrc?: string | null;
  title: string;
  payHref?: string;
}) {
  return (
    <section id="muestra" className="scroll-mt-24 space-y-5" aria-labelledby="guide-sample-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">Muestra gratis</p>
        <h2 id="guide-sample-title" className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
          Así se lee por dentro
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          {GUIDE_VPO_TAGLINE} Aquí tienes tres páginas reales desarrolladas —no solo el índice— para valorar
          profundidad, claridad y formato sin pagar. Lectura en pantalla dentro de Radar VPO.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[#f4efe6]">
          <CourseCoverImage
            slug={slug}
            src={coverSrc}
            alt={`Portada de ${title}`}
            className="mx-auto h-auto max-h-[28rem] w-full object-contain object-top"
            label={title}
          />
          <p className="border-t border-[var(--stroke)] bg-white px-4 py-3 text-xs leading-5 text-[var(--ink-soft)]">
            Promesa prudente: ayuda a <strong className="text-[var(--ink)]">optar</strong> a una vivienda protegida.
            No garantiza conseguir una adjudicación.
          </p>
        </div>

        <div className="space-y-4">
          {GUIDE_SAMPLE_PAGES.map((page) => (
            <article key={page.id} className="public-card p-4 md:p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
                {page.kicker}
              </p>
              <h3 className="mt-1 text-base font-black text-[var(--ink)] md:text-lg">{page.title}</h3>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">
                Revisado {page.reviewedAt}
                {page.sources[0] ? (
                  <>
                    {' '}
                    · Fuente:{' '}
                    <a
                      href={page.sources[0].href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--green-700)] underline"
                    >
                      {page.sources[0].label}
                    </a>
                  </>
                ) : null}
              </p>
              <div className="mt-3 space-y-3">
                {page.sections.map((section) => (
                  <div key={section.heading}>
                    <p className="text-sm font-bold text-[var(--ink)]">{section.heading}</p>
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                        {paragraph}
                      </p>
                    ))}
                    {section.callout ? (
                      <p className="mt-2 rounded-xl bg-[var(--bg-eco)] px-3 py-2 text-xs leading-5 text-[var(--ink)]">
                        {section.callout}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={payHref} className="btn btn--primary btn--lg">
          Continuar con la guía completa
        </Link>
        <p className="text-sm text-[var(--ink-soft)]">
          Precio, formato y duración del acceso están junto al pago. Si la venta está cerrada, podrás dejar el email en
          lista de espera.
        </p>
      </div>
    </section>
  );
}
