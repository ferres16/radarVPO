'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { proHref, proPlan } from '@/lib/pro';

const whatsappContactUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_CONTACT_URL ||
  'https://wa.me/34600111222?text=Hola%2C%20quiero%20informaci%C3%B3n%20sobre%20Radar%20VPO.';

const hiddenPrefixes = ['/admin', '/login', '/register', '/account'];

function shouldHide(pathname: string) {
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return true;
  if (/^\/cursos\/[^/]+$/.test(pathname)) return true;
  return false;
}

function getCta(pathname: string) {
  if (pathname.startsWith('/acompanamiento')) {
    return {
      label: 'Hablar por WhatsApp',
      href: whatsappContactUrl,
      external: true,
      hint: 'Acompañamiento personalizado',
    };
  }

  return {
    label: proPlan.ctaLabel,
    href: proHref,
    external: /^https?:\/\//.test(proHref),
    hint: proPlan.price,
  };
}

export function MobileConversionBar() {
  const pathname = usePathname() || '/';

  useEffect(() => {
    const visible = !shouldHide(pathname);
    document.body.classList.toggle('has-mobile-cta', visible);
    return () => {
      document.body.classList.remove('has-mobile-cta');
    };
  }, [pathname]);

  if (shouldHide(pathname)) return null;

  const cta = getCta(pathname);

  return (
    <div className="mobile-conversion-bar md:hidden" role="region" aria-label="Acción principal">
      <div className="mobile-conversion-bar__inner">
        <div className="min-w-0">
          <p className="mobile-conversion-bar__label">Radar VPO</p>
          <p className="mobile-conversion-bar__hint">{cta.hint}</p>
        </div>
        {cta.external ? (
          <a href={cta.href} className="btn btn--primary shrink-0" rel="noopener noreferrer" target="_blank">
            {cta.label}
          </a>
        ) : (
          <Link href={cta.href} className="btn btn--primary shrink-0">
            {cta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
