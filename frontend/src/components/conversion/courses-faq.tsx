import { courseFaqs } from '@/lib/conversion';

export function CoursesFaq() {
  return (
    <section className="lp-faq" aria-labelledby="courses-faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">FAQ</p>
        <h2 id="courses-faq-title" className="lp-title lp-title--sm">
          Dudas sobre la academia VPO
        </h2>
      </div>
      <div className="lp-faq__list">
        {courseFaqs.map((item) => (
          <details key={item.question} className="lp-faq__item">
            <summary className="lp-faq__question">{item.question}</summary>
            <p className="lp-faq__answer">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
