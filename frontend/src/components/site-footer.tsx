import Link from 'next/link';
import { primaryNavLinks } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Radar VPO</p>
          <p className="site-footer__tagline">
            Alertas y preparación para conseguir vivienda protegida en Cataluña antes que el resto.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Enlaces del sitio">
          {primaryNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="site-footer__cta">
          <Link href={proHref} className="btn btn--primary">
            {proPlan.ctaLabel}
          </Link>
          <p className="site-footer__price">{proPlan.price}</p>
        </div>
      </div>
      <div className="shell site-footer__legal">
        <p>© {new Date().getFullYear()} Radar VPO. Información orientativa; no sustituye fuentes oficiales.</p>
      </div>
    </footer>
  );
}
