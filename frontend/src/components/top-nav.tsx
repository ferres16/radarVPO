"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { primaryNavLinks } from '@/lib/navigation';
import { proHref, proPlan } from '@/lib/pro';
import type { UserProfile } from '@/types';

const primaryLinks = primaryNavLinks;

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const proIsExternal = /^https?:\/\//.test(proHref);

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

  const isActive = (href: string) => {
    const normalizedHref = href.split('?')[0].split('#')[0];
    if (href === '/') return pathname === '/';
    return pathname === normalizedHref || pathname.startsWith(`${normalizedHref}/`);
  };

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
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-3">
      <div className="glass-surface mx-auto flex w-full max-w-[1240px] items-center justify-between rounded-[1.5rem] px-3 py-2 md:px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          aria-label="Radar VPO, ir al inicio"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm transition duration-200 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-radar-vpo.png" alt="" className="h-full w-full object-contain p-0.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-tight text-[var(--ink)]">Radar VPO</span>
            <span className="block text-[11px] font-semibold text-[var(--ink-soft)]">Habitatge públic</span>
          </span>
        </Link>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--stroke)] bg-white/90 text-[var(--ink)] shadow-sm transition hover:bg-[var(--bg-eco)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span className="sr-only">{mobileOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
          <span className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">
          {primaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`relative rounded-full px-2.5 py-2 text-[13px] font-semibold transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:px-3 xl:text-sm ${
                active
                  ? 'bg-[rgba(22,112,85,0.10)] text-[var(--green-700)]'
                  : 'text-[var(--ink)] hover:bg-white/80'
              }`}
            >
              {link.label}
              {active ? <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--cyan-500)]" /> : null}
            </Link>
            );
          })}
        </nav>

        <nav className="hidden items-center gap-2 md:flex" aria-label="Acceso de usuario">
          {proIsExternal ? (
            <a
              href={proHref}
              className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              {proPlan.ctaLabel}
            </a>
          ) : (
            <Link
              href={proHref}
              className="rounded-full bg-[var(--green-700)] px-4 py-2 text-sm font-black text-white shadow-card transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
            >
              {proPlan.ctaLabel}
            </Link>
          )}
          {me ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white/90 px-2 py-1.5 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                onClick={() => setMenuOpen((value) => !value)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-eco)] text-xs font-bold text-[var(--green-700)] ring-1 ring-white">
                  {initials}
                </span>
                <span className="hidden max-w-32 truncate text-sm md:inline">{me.fullName || 'Perfil'}</span>
                <span aria-hidden="true" className={`text-xs transition ${menuOpen ? 'rotate-180' : ''}`}>v</span>
              </button>
              {menuOpen ? (
                <div
                  className="absolute right-0 mt-3 w-56 rounded-3xl border border-[var(--stroke)] bg-white p-2 shadow-card animate-fade-up"
                  role="menu"
                >
                  <Link
                    href="/account"
                    className="block rounded-2xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                    onClick={() => setMenuOpen(false)}
                    role="menuitem"
                  >
                  Perfil
                  </Link>
                  {me.role === 'admin' ? (
                    <Link
                      href="/admin"
                      className="block rounded-2xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                      onClick={() => setMenuOpen(false)}
                      role="menuitem"
                    >
                      Panel admin
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-[var(--stroke)] bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
              >
                Iniciar Sesión
              </Link>
            </>
          )}
        </nav>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 top-0 z-[-1] bg-[rgba(16,24,40,0.32)] backdrop-blur-sm md:hidden" onClick={() => setMobileOpen(false)} />
      ) : null}

      {mobileOpen ? (
        <nav
          id="mobile-navigation"
          className="mx-auto mt-3 max-w-[1180px] rounded-[1.75rem] border border-white/70 bg-white p-3 shadow-[0_18px_50px_rgba(16,24,40,0.18)] animate-slide-down md:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="space-y-2">
            <li>
              {proIsExternal ? (
                <a
                  href={proHref}
                  className="block rounded-2xl bg-[var(--green-700)] px-4 py-3 text-center text-sm font-black text-white"
                  onClick={() => setMobileOpen(false)}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {proPlan.ctaLabel}
                </a>
              ) : (
                <Link
                  href={proHref}
                  className="block rounded-2xl bg-[var(--green-700)] px-4 py-3 text-center text-sm font-black text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {proPlan.ctaLabel}
                </Link>
              )}
            </li>
            {primaryLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    isActive(link.href)
                      ? 'border-[rgba(22,112,85,0.22)] bg-[var(--bg-eco)] text-[var(--green-700)]'
                      : 'border-[var(--stroke)] bg-[var(--bg-app)] text-[var(--ink)]'
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.mobileLabel ?? link.label}
                </Link>
              </li>
            ))}
            {me ? (
              <li>
                <Link
                  href="/account"
                  className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Perfil
                </Link>
              </li>
            ) : null}
            {me?.role === 'admin' ? (
              <li>
                <Link
                  href="/admin"
                  className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Panel admin
                </Link>
              </li>
            ) : null}
            {me ? (
              <li>
                <button
                  type="button"
                  className="block w-full rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-left text-sm font-semibold text-[var(--ink)]"
                  onClick={() => {
                    setMobileOpen(false);
                    void handleLogout();
                  }}
                >
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <li>
                <Link
                  href="/login"
                  className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
                  onClick={() => setMobileOpen(false)}
                >
                  Iniciar Sesión
                </Link>
              </li>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
