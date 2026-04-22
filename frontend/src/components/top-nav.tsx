"use client";

import { useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/promotions', label: 'Todas las promociones' },
  { href: '/news', label: 'Noticias' },
  { href: '/services', label: 'Servicios' },
  { href: '/account', label: 'Tu cuenta' },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--stroke)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-extrabold uppercase tracking-wide text-[var(--green-700)]">
          Radar VPO
        </Link>
        <button
          type="button"
          className="rounded-full border border-[var(--stroke)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[var(--ink)] md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-label="Abrir menú"
        >
          Menú
        </button>
        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {mobileOpen ? (
        <nav className="border-t border-[var(--stroke)] bg-white px-4 py-3 md:hidden">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
