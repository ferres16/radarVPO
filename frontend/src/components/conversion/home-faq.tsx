'use client';

import { homeFaqs } from '@/lib/conversion';

export function HomeFaq() {
  return (
    <div aria-labelledby="faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="lp-title">
          Preguntas frecuentes
        </h2>
        <p className="lp-lead">
          Respuestas claras sobre la cuenta gratuita, avisos y el curso Guía VPO.
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
    </div>
  );
}
