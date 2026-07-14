'use client';

import Link from 'next/link';
import { homeFaqs } from '@/lib/conversion';
import { ProCta } from '@/components/pro/pro-cta';

export function HomeFaq() {
  return (
    <div aria-labelledby="faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="lp-title">
          Todo lo que necesitas saber sobre VPO PRO
        </h2>
        <p className="lp-lead">
          Respuestas claras sobre la cuenta gratuita, VPO PRO, avisos y el curso Guía VPO.
        </p>
      </div>
      <div className="lp-faq">
        {homeFaqs.map((item) => (
          <details key={item.question} className="lp-faq__item">
            <summary className="lp-faq__question">{item.question}</summary>
            <p className="lp-faq__answer">{item.answer}</p>
          </details>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <ProCta size="lg" block />
        <Link href="/register" className="btn btn--secondary btn--lg btn--block text-center">
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  );
}
