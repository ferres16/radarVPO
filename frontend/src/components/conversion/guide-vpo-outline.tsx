import { HomeFaq } from '@/components/conversion/home-faq';
import {
  GUIDE_VPO_CHAPTERS,
  GUIDE_VPO_FAQS,
  GUIDE_VPO_NOT_INCLUDED,
  GUIDE_VPO_VALUE,
} from '@/lib/guide-vpo';

export function GuideVpoChapters({
  title = 'Lo que te ayuda a prepararte',
}: {
  title?: string;
}) {
  return (
    <article className="public-card p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
        Dentro encontrarás
      </p>
      <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">{title}</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {GUIDE_VPO_CHAPTERS.map((chapter) => (
          <li key={chapter.title} className="rounded-2xl bg-[var(--bg-app)] px-4 py-3">
            <p className="text-sm font-bold text-[var(--ink)]">{chapter.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{chapter.hook}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function GuideVpoOutline() {
  return (
    <div className="space-y-6">
      <article className="public-card p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
          Por qué esta guía
        </p>
        <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
          De la información dispersa a acciones claras
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">{GUIDE_VPO_VALUE}</p>
        <p className="mt-4 text-xs leading-5 text-[var(--ink-soft)]">
          Lectura en pantalla · no descargable · no incluye asesoramiento personalizado
        </p>
      </article>

      <GuideVpoChapters />

      <article className="public-card p-5 md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
          Qué no incluye
        </p>
        <ul className="mt-4 space-y-2.5">
          {GUIDE_VPO_NOT_INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--ink-soft)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ink-soft)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </article>

      <HomeFaq items={GUIDE_VPO_FAQS} lead="Respuestas cortas sobre qué compra y qué no compra esta guía." />
    </div>
  );
}
