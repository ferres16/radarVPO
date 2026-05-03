"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { UserProfile } from '@/types';

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/alerts', label: 'Alertas' },
  { href: '/promotions', label: 'Todas las promociones' },
  { href: '/news', label: 'Noticias' },
  { href: '/services', label: 'Servicios' },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const profile = await api.getMe();
        if (active) {
          setMe(profile);
        }
      } catch {
        if (active) {
          setMe(null);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [pathname]);

  const initials = useMemo(() => {
    if (!me?.fullName) return me?.email?.slice(0, 2).toUpperCase() || 'RV';
    return me.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }, [me]);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore logout failures and still redirect.
    } finally {
      setMenuOpen(false);
      router.push('/login');
      router.refresh();
    }
  };

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
          {me ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-eco)] text-xs font-bold text-[var(--green-700)]">
                  {initials}
                </span>
                <span className="hidden text-sm md:inline">{me.fullName || 'Perfil'}</span>
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--stroke)] bg-white p-2 shadow-card"
                  role="menu"
                >
                  <Link
                    href="/account"
                    className="block rounded-xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)]"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                    Ver perfil
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)]"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Cerrar sesion
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-eco)]"
            >
              Iniciar sesion
            </Link>
          )}
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
            {me ? (
              <li>
                <Link
                  href="/account"
                  className="block rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Ver perfil
                </Link>
              </li>
            ) : null}
            {me ? (
              <li>
                <button
                  type="button"
                  className="block w-full rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-left text-sm font-semibold text-[var(--ink)]"
                  onClick={() => {
                    setMobileOpen(false);
                    void handleLogout();
                  }}
                >
                  Cerrar sesion
                </button>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="block rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2 text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar sesion
                </Link>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
