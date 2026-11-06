'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { primaryNavLinks } from '@/lib/navigation';
import { supportEmail } from '@/lib/legal';
import { useOptionalConsent } from '@/components/consent/consent-provider';
import { LanguageSwitcher } from '@/components/i18n/language-switcher';
import { useLocale } from '@/components/i18n/locale-provider';
import { useProAccess } from '@/components/pro-access-provider';

export function SiteFooter() {
  const pathname = usePathname();
  const { me, loading } = useProAccess();
  const consent = useOptionalConsent();
  const { t } = useLocale();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  const footerNav = primaryNavLinks.map((link) => {
    if (link.href === '/') return { ...link, label: t.nav.home };
    if (link.href === '/promotions') return { ...link, label: t.nav.published };
    if (link.href === '/alerts') return { ...link, label: t.nav.launches };
    if (link.href.startsWith('/cursos/')) return { ...link, label: t.nav.guide };
    if (link.href === '/pro') return { ...link, label: t.nav.pro };
    if (link.href === '/news') return { ...link, label: t.nav.news };
    return link;
  });

  return (
    <footer className="site-footer">
      <div className="shell site-footer__inner">
        <div>
          <p className="site-footer__brand">Radar VPO</p>
          <p className="site-footer__tagline">{t.footer.tagline}</p>
          {supportEmail ? (
            <p className="site-footer__tagline">
              {t.footer.support}{' '}
              <a href={`mailto:${supportEmail}`} className="underline">
                {supportEmail}
              </a>
            </p>
          ) : null}
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              {t.footer.language}
            </p>
            <LanguageSwitcher />
          </div>
        </div>
        <nav className="site-footer__nav" aria-label={t.footer.siteLinks}>
          {footerNav.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          {!loading && me ? (
            <Link href="/account">{t.nav.account}</Link>
          ) : !loading ? (
            <Link href="/login">{t.nav.login}</Link>
          ) : null}
        </nav>
      </div>
      <div className="shell site-footer__legal">
        <p>
          © {new Date().getFullYear()} Radar VPO. {t.footer.legalNote}{' '}
          <Link href="/contacto" className="underline">
            {t.footer.contact}
          </Link>{' '}
          ·{' '}
          <Link href="/aviso-legal" className="underline">
            {t.footer.legalNotice}
          </Link>{' '}
          ·{' '}
          <Link href="/condiciones" className="underline">
            {t.footer.terms}
          </Link>{' '}
          ·{' '}
          <Link href="/privacidad" className="underline">
            {t.footer.privacy}
          </Link>{' '}
          ·{' '}
          <Link href="/cookies" className="underline">
            {t.footer.cookies}
          </Link>
          {consent ? (
            <>
              {' '}
              ·{' '}
              <button type="button" className="underline" onClick={consent.openSettings}>
                {t.footer.manageCookies}
              </button>
            </>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
