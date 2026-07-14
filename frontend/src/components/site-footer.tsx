'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { primaryNavLinks } from '@/lib/navigation';
import { proPlan } from '@/lib/pro';
import { ProCtaLink, ProGate } from '@/components/pro/pro-cta';

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
            Vivienda pública y protegida (VPO/HPO) en Cataluña: promociones, lanzamientos y actualidad en un solo sitio.
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
        <ProGate>
          <div className="site-footer__cta">
            <ProCtaLink className="btn btn--primary btn--block md:!inline-flex" />
            <p className="site-footer__price">{proPlan.price}</p>
          </div>
        </ProGate>
      </div>
      <div className="shell site-footer__legal">
        <p>© {new Date().getFullYear()} Radar VPO. Información orientativa; no sustituye fuentes oficiales.</p>
      </div>
    </footer>
  );
}
