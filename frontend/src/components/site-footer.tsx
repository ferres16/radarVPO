'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { primaryNavLinks, secondaryNavLinks } from '@/lib/navigation';
import { supportEmail } from '@/lib/legal';
import { useOptionalConsent } from '@/components/consent/consent-provider';
import { useProAccess } from '@/components/pro-access-provider';

export function SiteFooter() {
  const pathname = usePathname();
  const { me, loading } = useProAccess();
  const consent = useOptionalConsent();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Radar VPO</p>
          <p className="site-footer__tagline">
            Consulta promociones de vivienda protegida en Cataluña, entiende el contexto con una guía y organiza tus oportunidades.
          </p>
          {supportEmail ? (
            <p className="site-footer__tagline">
              Soporte (compras, acceso y problemas técnicos):{' '}
              <a href={`mailto:${supportEmail}`} className="underline">
                {supportEmail}
              </a>
            </p>
          ) : null}
        </div>
        <nav className="site-footer__nav" aria-label="Enlaces del sitio">
          {primaryNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.mobileLabel ?? link.label}
            </Link>
          ))}
          {secondaryNavLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {!loading && me ? (
            <>
              <Link href="/mi-espacio">Mi espacio</Link>
              <Link href="/account">Mi cuenta</Link>
            </>
          ) : !loading ? (
            <Link href="/login">Entrar</Link>
          ) : null}
        </nav>
      </div>
      <div className="shell site-footer__legal">
        <p>
          © {new Date().getFullYear()} Radar VPO. Información orientativa; no sustituye fuentes oficiales.{' '}
          <Link href="/contacto" className="underline">
            Contacto
          </Link>{' '}
          ·{' '}
          <Link href="/aviso-legal" className="underline">
            Aviso legal
          </Link>{' '}
          ·{' '}
          <Link href="/condiciones" className="underline">
            Condiciones
          </Link>{' '}
          ·{' '}
          <Link href="/privacidad" className="underline">
            Privacidad
          </Link>{' '}
          ·{' '}
          <Link href="/cookies" className="underline">
            Cookies
          </Link>
          {consent ? (
            <>
              {' '}
              ·{' '}
              <button type="button" className="underline" onClick={consent.openSettings}>
                Gestionar cookies
              </button>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
