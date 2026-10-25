import Link from 'next/link';
import { CourseCoverImage } from '@/components/course-cover-image';
import { GUIDE_VPO_CHAPTERS, GUIDE_VPO_TAGLINE } from '@/lib/guide-vpo';

/** Muestra real gratuita: portada + extractos de capítulos (sin cuenta). */
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
  const sampleChapters = GUIDE_VPO_CHAPTERS.slice(0, 4);

  return (
    <section id="muestra" className="scroll-mt-24 space-y-5" aria-labelledby="guide-sample-title">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">Muestra gratis</p>
        <h2 id="guide-sample-title" className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
          Así se lee por dentro
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
          {GUIDE_VPO_TAGLINE} Lectura en pantalla dentro de Radar VPO: no es un archivo descargable.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="overflow-hidden rounded-2xl border border-[var(--stroke)] bg-[#f4efe6]">
          <CourseCoverImage
            slug={slug}
            src={coverSrc}
            alt={`Portada de ${title}`}
            className="mx-auto h-auto max-h-[28rem] w-full object-contain object-top"
            label={title}
          />
        </div>
        <ol className="space-y-3">
          {sampleChapters.map((chapter, index) => (
            <li key={chapter.title} className="public-card p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Capítulo {index + 1}
              </p>
              <h3 className="mt-1 text-base font-black text-[var(--ink)]">{chapter.title}</h3>
              <p className="mt-1 text-sm font-semibold text-[var(--green-700)]">{chapter.hook}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{chapter.readerCare}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Link href={payHref} className="btn btn--primary btn--lg">
          Continuar con la guía completa
        </Link>
        <p className="text-sm text-[var(--ink-soft)]">
          Precio, formato y duración del acceso están junto al pago.
        </p>
      </div>
    </section>
  );
}
