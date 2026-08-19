"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { primaryNavLinks } from '@/lib/navigation';
import { ProCtaLink } from '@/components/pro/pro-cta';
import { useProAccess } from '@/components/pro-access-provider';

const primaryLinks = primaryNavLinks;

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { me, hasPro } = useProAccess();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.classList.add('nav-scroll-lock');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.classList.remove('nav-scroll-lock');
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
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
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Ignore logout failures and still redirect.
    } finally {
      setMenuOpen(false);
      setMobileOpen(false);
      setLoggingOut(false);
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 pt-2 md:pt-3">
      <div className="glass-surface relative mx-auto flex w-full max-w-[1240px] items-center gap-2 rounded-[1.5rem] px-3 py-2 md:gap-3 md:px-4">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 rounded-full px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          aria-label="Radar VPO, ir al inicio"
        >
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white transition duration-200 group-hover:scale-105">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-radar-vpo.png" alt="" className="h-full w-full object-contain p-0.5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-black tracking-tight text-[var(--ink)]">Radar VPO</span>
            <span className="hidden text-[11px] font-semibold text-[var(--ink-soft)] 2xl:block">
              Habitatge públic
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--stroke)] bg-white/90 text-[var(--ink)] transition hover:bg-[var(--bg-eco)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] lg:hidden"
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

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex xl:gap-3">
          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Navegación principal"
          >
            {primaryLinks.map((link) => {
              const active = isActive(link.href);
              const navLabel = link.navLabel ?? link.label;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={link.label}
                  aria-current={active ? 'page' : undefined}
                  aria-label={navLabel === link.label ? undefined : link.label}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-2.5 py-2 text-[13px] font-semibold transition duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:px-3 xl:text-sm ${
                    active
                      ? 'bg-[rgba(22,112,85,0.10)] text-[var(--green-700)]'
                      : 'text-[var(--ink)] hover:bg-white/80'
                  }`}
                >
                  {navLabel}
                  {active ? (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-[var(--cyan-500)]" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <nav className="flex shrink-0 items-center gap-2" aria-label="Acceso de usuario">
            {!hasPro ? (
              <ProCtaLink
                label="Activar PRO"
                className="whitespace-nowrap rounded-full bg-[var(--green-700)] px-3.5 py-2 text-[13px] font-black text-white transition hover:-translate-y-0.5 hover:bg-[var(--green-900)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:px-4 xl:text-sm"
              />
            ) : null}
            {me ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white/90 px-2 py-1.5 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label={`Menú de ${me.fullName || 'usuario'}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-eco)] text-xs font-bold text-[var(--green-700)] ring-1 ring-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm 2xl:inline">{me.fullName || 'Perfil'}</span>
                  <span aria-hidden="true" className={`hidden text-xs transition 2xl:inline ${menuOpen ? 'rotate-180' : ''}`}>
                    v
                  </span>
                </button>
                {menuOpen ? (
                  <div
                    className="absolute right-0 mt-3 w-56 rounded-3xl border border-[var(--stroke)] bg-white p-2 animate-fade-up"
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
                      disabled={loggingOut}
                      className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] disabled:opacity-60"
                      onClick={() => void handleLogout()}
                      role="menuitem"
                    >
                      {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full border border-[var(--stroke)] bg-white/90 px-3.5 py-2 text-[13px] font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:px-4 xl:text-sm"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[rgba(16,24,40,0.38)] backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      {mobileOpen ? (
        <nav
          id="mobile-navigation"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(80dvh,32rem)] overflow-y-auto rounded-[1.5rem] border border-white/80 bg-white p-3 animate-slide-down lg:hidden"
          aria-label="Navegación móvil"
        >
          <ul className="space-y-2">
            {!hasPro ? (
              <li>
                <ProCtaLink className="block rounded-2xl bg-[var(--green-700)] px-4 py-3 text-center text-sm font-black text-white" />
              </li>
            ) : null}
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
                  disabled={loggingOut}
                  className="block w-full rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-left text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
                  onClick={() => {
                    setMobileOpen(false);
                    void handleLogout();
                  }}
                >
                  {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
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
