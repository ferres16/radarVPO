"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { primaryNavLinks } from '@/lib/navigation';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useLocale } from '@/components/i18n/locale-provider';
import { ProCtaLink } from '@/components/pro/pro-cta';
import { useProAccess } from '@/components/pro-access-provider';
import { proPlan } from '@/lib/pro';

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { me, hasPro, setMe } = useProAccess();
  const { t, format } = useLocale();
  const pathname = usePathname();

  const navItems = useMemo(
    () =>
      primaryNavLinks.map((link) => {
        if (link.href === '/') {
          return { ...link, label: t.nav.home, navLabel: t.nav.home, mobileLabel: t.nav.home };
        }
        if (link.href === '/promotions') {
          return {
            ...link,
            label: t.nav.published,
            navLabel: t.nav.publishedShort,
            mobileLabel: t.nav.published,
          };
        }
        if (link.href === '/alerts') {
          return {
            ...link,
            label: t.nav.launches,
            navLabel: t.nav.launchesShort,
            mobileLabel: t.nav.launches,
          };
        }
        if (link.href.startsWith('/cursos/')) {
          return { ...link, label: t.nav.guide, navLabel: t.nav.guide, mobileLabel: t.nav.guide };
        }
        if (link.href === '/pro') {
          return { ...link, label: t.nav.pro, navLabel: 'PRO', mobileLabel: t.nav.pro };
        }
        if (link.href === '/news') {
          return { ...link, label: t.nav.news, navLabel: t.nav.news, mobileLabel: t.nav.news };
        }
        return link;
      }),
    [t],
  );

  const proCtaLabel = format(t.pro.makeProWithPrice, { price: proPlan.priceShort });

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
      // Ignore logout failures and still clear local state.
    } finally {
      setMe(null);
      setMenuOpen(false);
      setMobileOpen(false);
      setLoggingOut(false);
      window.location.assign('/');
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

        <div className="ml-auto flex min-w-0 items-center gap-2 lg:hidden">
          <LanguageSwitcher compact />
          {!hasPro ? (
            <ProCtaLink label={proCtaLabel} className="pro-nav-cta shrink-0 px-3 text-xs sm:text-sm" />
          ) : null}
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--stroke)] bg-white/90 text-[var(--ink)] transition hover:bg-[var(--bg-eco)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
        >
          <span className="sr-only">{mobileOpen ? t.nav.closeMenu : t.nav.openMenu}</span>
          <span className="flex flex-col gap-1.5">
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 rounded-full bg-current transition ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-2 lg:flex xl:gap-3">
          <nav
            className="flex min-w-0 flex-1 items-center justify-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Navegación principal"
          >
            {navItems.map((link) => {
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
            <LanguageSwitcher />
            {!hasPro ? (
              <ProCtaLink label={proCtaLabel} className="pro-nav-cta whitespace-nowrap xl:px-5 xl:text-sm" />
            ) : null}
            {me ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white/90 px-2 py-1.5 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                  onClick={() => setMenuOpen((value) => !value)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label={`${t.nav.userMenu}: ${me.fullName || me.email || ''}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-eco)] text-xs font-bold text-[var(--green-700)] ring-1 ring-white">
                    {initials}
                  </span>
                  <span className="hidden max-w-28 truncate text-sm 2xl:inline">{me.fullName || t.nav.account}</span>
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
                      {t.nav.account}
                    </Link>
                    {me.role === 'admin' ? (
                      <Link
                        href="/admin"
                        className="block rounded-2xl px-3 py-2 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
                        onClick={() => setMenuOpen(false)}
                        role="menuitem"
                      >
                        {t.nav.admin}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      disabled={loggingOut}
                      className="block w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-[var(--ink)] hover:bg-[var(--bg-app)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] disabled:opacity-60"
                      onClick={() => void handleLogout()}
                      role="menuitem"
                    >
                      {loggingOut ? t.nav.loggingOut : t.nav.logout}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link
                  href="/register"
                  className="whitespace-nowrap rounded-full border border-[var(--green-700)] bg-[var(--bg-eco)] px-3.5 py-2 text-[13px] font-bold text-[var(--green-700)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:px-4 xl:text-sm"
                >
                  {t.nav.registerFree}
                </Link>
                <Link
                  href="/login"
                  className="whitespace-nowrap rounded-full px-2 py-2 text-[13px] font-semibold text-[var(--ink)] transition hover:text-[var(--green-700)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)] xl:text-sm"
                >
                  {t.nav.login}
                </Link>
              </>
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
            <li className="px-1 pb-1">
              <LanguageSwitcher />
            </li>
            {!hasPro ? (
              <li>
                <ProCtaLink label={proCtaLabel} className="pro-nav-cta pro-nav-cta--block" />
              </li>
            ) : null}
            {navItems.map((link) => (
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
                  {t.nav.account}
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
                  {t.nav.admin}
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
                  {loggingOut ? t.nav.loggingOut : t.nav.logout}
                </button>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/register"
                    className="block rounded-2xl border border-[var(--green-700)] bg-[var(--bg-eco)] px-4 py-3 text-center text-sm font-black text-[var(--green-700)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.registerFree}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t.nav.login}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
