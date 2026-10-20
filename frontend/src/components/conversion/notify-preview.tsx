import { shortenAlertTitle } from '@/lib/alert-title';
import { previewPublicationNotify } from '@/lib/pro-notify-preview';
import { promotionNotifyLocation } from '@/lib/public-promotions';
import { absoluteUrl } from '@/lib/seo';
import type { Promotion } from '@/types';

/** El SMS y el asunto reales de una promoción publicada. */
export function NotifyPreview({ promotion }: { promotion: Promotion }) {
  const copy = previewPublicationNotify({
    title: shortenAlertTitle(promotion.title),
    location: promotionNotifyLocation(promotion),
    promotionsUrl: absoluteUrl(`/promotions/${promotion.id}`),
  });

  return (
    <figure className="lp-product-demo">
      <figcaption className="lp-product-demo__caption">Aviso que envía PRO</figcaption>
      <div className="lp-notify">
        <article className="lp-notify__card">
          <p className="lp-notify__kicker">SMS · 160 caracteres</p>
          <p className="lp-notify__sms">{copy.sms}</p>
        </article>
        <article className="lp-notify__card">
          <p className="lp-notify__kicker">Email</p>
          <p className="lp-notify__subject">{copy.subject}</p>
          <p className="lp-notify__intro">{copy.intro}</p>
        </article>
      </div>
      <p className="lp-product-demo__note">
        Mismo texto que el sistema envía al publicarse una promoción. El enlace abre esta convocatoria.
      </p>
    </figure>
  );
}
