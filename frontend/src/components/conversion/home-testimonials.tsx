import { homeTestimonials } from '@/lib/conversion';

export function HomeTestimonials() {
  return (
    <section className="lp-section" aria-labelledby="testimonials-title">
      <div className="lp-section__head">
        <p className="lp-eyebrow">Confianza</p>
        <h2 id="testimonials-title" className="lp-title">
          Personas que llegaron preparadas al plazo
        </h2>
      </div>
      <div className="lp-testimonials">
        {homeTestimonials.map((item) => (
          <figure key={item.id} className="lp-testimonial">
            {item.placeholder ? (
              <span className="lp-testimonial__placeholder">Ejemplo de testimonio</span>
            ) : null}
            <blockquote className="lp-testimonial__quote">&ldquo;{item.quote}&rdquo;</blockquote>
            <figcaption className="lp-testimonial__meta">
              <strong>{item.name}</strong>
              <span>{item.location}</span>
              <span className="lp-testimonial__result">{item.result}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
