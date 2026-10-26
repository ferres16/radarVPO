'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type AdminNavLink = {
  href: string;
  label: string;
};

type AdminNavGroup = {
  title: string;
  links: AdminNavLink[];
};

const adminGroups: AdminNavGroup[] = [
  {
    title: 'Resumen',
    links: [{ href: '/admin', label: 'Dashboard' }],
  },
  {
    title: 'Clientes',
    links: [
      { href: '/admin/users', label: 'Usuarios' },
      { href: '/admin/access', label: 'Compras y accesos' },
      { href: '/admin/cancellations', label: 'Bajas PRO' },
    ],
  },
  {
    title: 'Contenido',
    links: [
      { href: '/admin/promotions', label: 'Promociones' },
      { href: '/admin/alerts', label: 'Avisos' },
      { href: '/admin/news', label: 'Noticias' },
      { href: '/admin/courses', label: 'Cursos' },
      { href: '/admin/files', label: 'Archivos' },
    ],
  },
  {
    title: 'Operación',
    links: [
      { href: '/admin/commerce', label: 'Comercio' },
      { href: '/admin/message-templates', label: 'Emails / SMS' },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  if (href === '/admin/promotions') {
    return pathname === href || pathname.startsWith('/admin/promotions/');
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
        Admin
      </p>
      <nav className="mt-1 space-y-4" aria-label="Navegación de administración">
        {adminGroups.map((group) => (
          <div key={group.title}>
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.links.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? 'bg-[var(--bg-eco)] text-[var(--green-700)]'
                        : 'text-[var(--ink)] hover:bg-[var(--bg-app)]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
