import { TrackedButtonLink } from '@/components/tracked-link';
import { promotionPlaceLabel } from '@/lib/public-promotions';
import type { Promotion } from '@/types';

/** El visor de verdad: misma barra y una convocatoria publicada ahora. */
export function PdfViewerDemo({ promotion }: { promotion: Promotion }) {
  const place = promotionPlaceLabel(promotion);
  const published = promotion.publishedAt?.slice(0, 10);

  return (
    <figure className="lp-product-demo">
      <figcaption className="lp-product-demo__caption">Visor del PDF oficial</figcaption>
      <div className="lp-product-demo__chrome">
        <div className="lp-product-demo__doc">
          <p className="lp-product-demo__kicker">Bases</p>
          <p className="lp-product-demo__heading">{promotion.title}</p>
          <p className="lp-product-demo__meta">
            {place}
            {published ? ` · Publicada ${published}` : ''}
          </p>
        </div>
        <div className="lp-product-demo__toolbar" aria-hidden="true">
          <span>‹</span>
          <span>1 / …</span>
          <span>›</span>
          <span className="lp-product-demo__zoom">100%</span>
          <span className="ml-auto">Abrir original</span>
        </div>
        <div className="lp-product-demo__cta">
          <p className="text-sm leading-6 text-[var(--ink)]">
            Esta convocatoria está publicada. El visor abre el documento oficial, con zoom, páginas y descarga.
          </p>
          <div className="mt-3">
            <TrackedButtonLink
              href={`/promotions/${promotion.id}`}
              event="promotion_pdf_cta_clicked"
              eventProperties={{ promotionId: promotion.id, source: 'home_viewer_demo' }}
              block
            >
              Ver PDF de la promoción
            </TrackedButtonLink>
          </div>
        </div>
      </div>
    </figure>
  );
}
