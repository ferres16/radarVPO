'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { primaryNavLinks } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Radar VPO</p>
          <p className="site-footer__tagline">
            La plataforma de referencia para detectar y preparar tu solicitud VPO en Cataluña.
          </p>
        </div>
        <nav className="site-footer__nav" aria-label="Enlaces del sitio">
          {primaryNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.mobileLabel ?? link.label}
            </Link>
          ))}
          <Link href="/login">Entrar</Link>
        </nav>
        <div className="site-footer__cta">
          <Link href={proHref} className="btn btn--primary btn--block md:!inline-flex">
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
