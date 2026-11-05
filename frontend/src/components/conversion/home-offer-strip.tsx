import { TrackedButtonLink } from '@/components/tracked-link';
import { RegisterButton } from '@/components/conversion/register-promo';
import { homeOfferLayers } from '@/lib/conversion';

type GuideOffer = {
  href: string;
  price: string;
  cta: string;
};

export function HomeOfferStrip({ guide }: { guide?: GuideOffer }) {
  return (
    <div className="lp-offer-grid">
      {homeOfferLayers.map((layer) => {
        const href = layer.id === 'learn' && guide ? guide.href : layer.href;
        const price = layer.id === 'learn' && guide ? guide.price : layer.price;
        const cta = layer.id === 'learn' && guide ? guide.cta : layer.cta;
        const primary = layer.id === 'learn';
        return (
          <article key={layer.id} className={`lp-offer-card${primary ? ' lp-offer-card--primary' : ''}`}>
            <p className="lp-offer-card__eyebrow">{layer.eyebrow}</p>
            <p className="lp-offer-card__price">{price}</p>
            <h3 className="lp-offer-card__title">{layer.title}</h3>
            <p className="lp-offer-card__text">{layer.description}</p>
            <div className="mt-4">
              {layer.id === 'consult' ? (
                <RegisterButton
                  source="home_offer"
                  size="md"
                  variant="secondary"
                  block
                  fallback={
                    <TrackedButtonLink
                      href="/promotions"
                      event="promotion_list_cta_clicked"
                      eventProperties={{ source: 'home_offer', layer: layer.id }}
                      variant="secondary"
                      block
                    >
                      Ver promociones
                    </TrackedButtonLink>
                  }
                >
                  {cta}
                </RegisterButton>
              ) : (
              <TrackedButtonLink
                href={href}
                event={layer.event}
                eventProperties={{ source: 'home_offer', layer: layer.id }}
                variant={primary ? 'primary' : 'secondary'}
                block
              >
                {cta}
              </TrackedButtonLink>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
