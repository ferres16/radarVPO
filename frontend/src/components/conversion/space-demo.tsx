import Link from 'next/link';
import { CHECKLIST_ITEMS, STAGES } from '@/lib/my-space';
import { promotionPlaceLabel } from '@/lib/public-promotions';
import type { Promotion } from '@/types';

/** Misma lista de pasos y etapas que Mi espacio, con una promoción publicada. */
export function SpaceDemo({ promotion }: { promotion: Promotion }) {
  const place = promotionPlaceLabel(promotion);

  return (
    <figure className="lp-product-demo">
      <figcaption className="lp-product-demo__caption">Mi espacio, con una promoción real</figcaption>
      <article className="lp-space-demo">
        <div className="lp-space-demo__head">
          <div className="min-w-0">
            <p className="lp-space-demo__title">{promotion.title}</p>
            {place ? <p className="mt-1 text-sm text-[var(--ink-soft)]">{place}</p> : null}
          </div>
          <span className="chip shrink-0">{STAGES[0].label}</span>
        </div>
        <p className="mt-3 text-xs font-semibold text-[var(--ink-soft)]">
          Mis pasos · 0 de {CHECKLIST_ITEMS.length}
        </p>
        <ul className="lp-space-demo__list">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item.id} className="lp-space-demo__item">
              <span className="lp-space-demo__box" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <Link
          href={`/promotions/${promotion.id}`}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-[var(--green-700)]"
        >
          Ver PDF de la promoción
        </Link>
      </article>
      <p className="lp-product-demo__note">
        Estos son los mismos pasos que marca cada persona en Mi espacio. Gratis hasta 3 promociones; PRO quita el
        límite.
      </p>
    </figure>
  );
}
