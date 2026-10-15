import { TrackedButtonLink } from '@/components/tracked-link';
import { homeOfferLayers } from '@/lib/conversion';

export function HomeOfferStrip() {
  return (
    <div className="lp-offer-grid">
      {homeOfferLayers.map((layer) => (
        <article key={layer.id} className={`lp-offer-card${layer.id === 'consult' ? ' lp-offer-card--primary' : ''}`}>
          <p className="lp-offer-card__eyebrow">{layer.eyebrow}</p>
          <p className="lp-offer-card__price">{layer.price}</p>
          <h3 className="lp-offer-card__title">{layer.title}</h3>
          <p className="lp-offer-card__text">{layer.description}</p>
          <div className="mt-4">
            <TrackedButtonLink
              href={layer.href}
              event={layer.event}
              eventProperties={{ source: 'home_offer', layer: layer.id }}
              variant={layer.id === 'consult' ? 'primary' : 'secondary'}
            >
              {layer.cta}
            </TrackedButtonLink>
          </div>
        </article>
      ))}
    </div>
  );
}
