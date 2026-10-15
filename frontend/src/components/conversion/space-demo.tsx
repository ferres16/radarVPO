import { CHECKLIST_ITEMS, STAGES } from '@/lib/my-space';

/** Maqueta de Mi espacio con las mismas etapas y pasos que el producto real. */
export function SpaceDemo() {
  const previewChecks = CHECKLIST_ITEMS.slice(0, 4);

  return (
    <figure className="lp-product-demo">
      <figcaption className="lp-product-demo__caption">Así se ve Mi espacio</figcaption>
      <div className="lp-space-demo" aria-hidden="true">
        <div className="lp-space-demo__head">
          <p className="lp-space-demo__title">Promoción de ejemplo</p>
          <span className="chip">{STAGES[1].label}</span>
        </div>
        <ul className="lp-space-demo__list">
          {previewChecks.map((item, index) => (
            <li key={item.id} className="lp-space-demo__item">
              <span className={`lp-space-demo__box${index < 2 ? ' lp-space-demo__box--on' : ''}`} />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="lp-product-demo__note">
        Ejemplo ilustrativo. Con cuenta gratuita guardas hasta 3 promociones; PRO quita el límite.
      </p>
    </figure>
  );
}
