'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const adminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/courses', label: 'Cursos CMS' },
  { href: '/admin/promotions', label: 'Promociones' },
  { href: '/admin/promotions/history', label: 'Histórico promociones' },
  { href: '/admin/alerts', label: 'Avisos' },
  { href: '/admin/services', label: 'Acompañamiento' },
  { href: '/admin/news', label: 'Noticias' },
  { href: '/admin/files', label: 'Archivos' },
  { href: '/admin/users', label: 'Usuarios' },
  { href: '/admin/access', label: 'Compras y accesos' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Backoffice</p>
      <nav className="mt-1 space-y-1" aria-label="Navegación de administración">
        {adminLinks.map((link) => {
          const active =
            pathname === link.href ||
            (link.href === '/admin/promotions'
              ? pathname.startsWith('/admin/promotions/') && !pathname.startsWith('/admin/promotions/history')
              : pathname.startsWith(`${link.href}/`));
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
      </nav>
    </aside>
  );
}
