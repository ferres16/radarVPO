'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabLinks = [
  { href: '/', label: 'Inicio', icon: 'home' as const },
  { href: '/alerts', label: 'Alertas', icon: 'alerts' as const },
  { href: '/promotions', label: 'Publicadas', icon: 'promotions' as const },
  { href: '/cursos', label: 'Cursos', icon: 'courses' as const },
  { href: '/account', label: 'Cuenta', icon: 'account' as const },
];

function Icon({ name }: { name: 'home' | 'alerts' | 'promotions' | 'courses' | 'account' }) {
  const paths: Record<typeof name, string> = {
    home: 'M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19v-8.5Z',
    alerts: 'M12 3a6 6 0 0 0-6 6v2.2L4.5 14A1.5 1.5 0 0 0 6 16.5h12a1.5 1.5 0 0 0 1.5-2.3L18 11.2V9a6 6 0 0 0-6-6Zm0 16.5a2.25 2.25 0 0 0 2.2-1.8H9.8a2.25 2.25 0 0 0 2.2 1.8Z',
    promotions: 'M6.5 5.5h11A1.5 1.5 0 0 1 19 7v10.5A1.5 1.5 0 0 1 17.5 19h-11A1.5 1.5 0 0 1 5 17.5V7a1.5 1.5 0 0 1 1.5-1.5Zm2 4h7m-7 3.5h4.5',
    courses: 'M5.5 7.5 12 4.5l6.5 3v8.5L12 19.5l-6.5-3.5V7.5Zm6.5 1.8 4.5 2.3M12 9.3v8.2',
    account: 'M12 12a3.75 3.75 0 1 0-3.75-3.75A3.75 3.75 0 0 0 12 12Zm0 2.25c-3.34 0-6 1.68-6 3.75V20h12v-1.88c0-2.07-2.66-3.75-6-3.75Z',
  };

  return (
    <svg className="mobile-tab-bar__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


export function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="mobile-tab-bar md:hidden" aria-label="Navegación principal móvil">
      <div className="mobile-tab-bar__inner">
        {tabLinks.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`mobile-tab-bar__link ${active ? 'mobile-tab-bar__link--active' : ''}`}
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
