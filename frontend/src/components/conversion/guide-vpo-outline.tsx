import Link from 'next/link';
import { HomeFaq } from '@/components/conversion/home-faq';
import {
  GUIDE_VPO_CHAPTERS,
  GUIDE_VPO_CHECKOUT_HREF,
  GUIDE_VPO_FAQS,
  GUIDE_VPO_INCLUDES,
  GUIDE_VPO_NOT_INCLUDED,
  GUIDE_VPO_OUTCOMES,
  GUIDE_VPO_SHORT,
  GUIDE_VPO_VALUE,
} from '@/lib/guide-vpo';

export function GuideVpoChapters({
  title = 'Qué incluye, capítulo a capítulo',
}: {
  title?: string;
}) {
  return (
    <article className="public-card p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
        Índice real
      </p>
      <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-[var(--ink-soft)]">{GUIDE_VPO_SHORT}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {GUIDE_VPO_CHAPTERS.map((chapter, index) => (
          <li key={chapter.title} className="rounded-2xl bg-[var(--bg-app)] px-4 py-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--green-700)]">
              {index + 1 <= 12 ? `Capítulo ${index + 1}` : 'Cierre'}
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--ink)]">{chapter.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{chapter.hook}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function GuideVpoOutcomes() {
  return (
    <article className="public-card p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
        Qué resuelve
      </p>
      <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
        Para llegar preparado, no improvisando
      </h2>
      <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)] md:text-base">{GUIDE_VPO_VALUE}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {GUIDE_VPO_OUTCOMES.map((item) => (
          <li key={item.title} className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3">
            <p className="text-sm font-bold text-[var(--ink)]">{item.title}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">{item.text}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function GuideVpoIncludes() {
  return (
    <article className="public-card p-5 md:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--green-700)]">
        Qué incluye
      </p>
      <h2 className="display-type mt-2 text-xl font-black text-[var(--ink)] md:text-2xl">
        Todo el recorrido, en un solo sitio
      </h2>
      <ul className="mt-4 space-y-2.5">
        {GUIDE_VPO_INCLUDES.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-[var(--ink)]">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        <Link href={GUIDE_VPO_CHECKOUT_HREF} className="btn btn--primary btn--lg">
          Ver precio y comprar
        </Link>
      </div>
    </article>
  );
}

export function GuideVpoOutline() {
  return (
    <div className="space-y-6">
      <GuideVpoOutcomes />
      <GuideVpoIncludes />
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

      <HomeFaq
        items={GUIDE_VPO_FAQS}
        lead="Respuestas cortas sobre qué compra y qué no compra esta guía."
      />

      <div className="public-cta-band">
        <div>
          <h2 className="lp-title lp-title--sm">Empieza por lo que sí controlas</h2>
          <p className="lp-lead">
            Documentación lista, registro activo y estrategia clara antes de que abra la siguiente promoción.
          </p>
        </div>
        <div className="public-cta-band__actions">
          <Link href={GUIDE_VPO_CHECKOUT_HREF} className="btn btn--primary btn--lg btn--block">
            Ir a pagar
          </Link>
        </div>
      </div>
    </div>
  );
}
