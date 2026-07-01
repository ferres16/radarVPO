import Link from 'next/link';
import { homeFaqs } from '@/lib/conversion';
import { proHref, proPlan } from '@/lib/pro';
import { ButtonLink } from '@/components/design-system';

export function HomeFaq() {
  return (
    <div aria-labelledby="faq-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Preguntas frecuentes</p>
        <h2 id="faq-title" className="lp-title">
          Todo lo que necesitas saber sobre VPO PRO
        </h2>
        <p className="lp-lead">
          Respuestas claras sobre alertas, promociones y formación en Cataluña.
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
        <ButtonLink href={proHref} size="lg" block>
          {proPlan.ctaLabel}
        </ButtonLink>
        <Link href="/register" className="btn btn--secondary btn--lg btn--block text-center">
          Crear cuenta gratis
        </Link>
      </div>
    </div>
  );
}
