import { homeFaqs } from '@/lib/conversion';

export function HomeFaq() {
  return (
    <section className="lp-section lp-section--border" aria-labelledby="faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="lp-title">
          Todo lo que necesitas saber sobre VPO PRO
        </h2>
        <p className="lp-lead">
          Respuestas claras sobre alertas de vivienda protegida, promociones VPO y el curso incluido en Cataluña.
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
    </section>
  );
}
