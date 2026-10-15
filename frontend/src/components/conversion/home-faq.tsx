import { homeFaqs } from '@/lib/conversion';

type FaqItem = { readonly question: string; readonly answer: string };

export function HomeFaq({
  items = homeFaqs,
  lead = 'Respuestas claras sobre qué es gratis, qué es de pago y qué no hace Radar VPO.',
}: {
  items?: readonly FaqItem[];
  lead?: string;
}) {
  return (
    <div aria-labelledby="faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="lp-title">
          Preguntas frecuentes
        </h2>
        <p className="lp-lead">{lead}</p>
      </div>
      <div className="lp-faq">
        {items.map((item) => (
          <details key={item.question} className="lp-faq__item">
            <summary className="lp-faq__question">{item.question}</summary>
            <p className="lp-faq__answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
