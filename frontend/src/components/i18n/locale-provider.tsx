'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  htmlLang,
  isLocale,
  parseLocale,
  type Locale,
} from '@/lib/i18n/locales';
import { formatMessage, getMessages, type Messages } from '@/lib/i18n/messages';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: Messages;
  format: (template: string, vars: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readCookieLocale(): Locale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  return parseLocale(match?.[1] ? decodeURIComponent(match[1]) : undefined);
}

function writeCookieLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  try {
    window.localStorage.setItem(LOCALE_COOKIE, locale);
  } catch {
    // ignore quota / private mode
  }
}

function readStoredLocale(initial?: Locale): Locale {
  if (initial && isLocale(initial)) return initial;
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const fromStorage = window.localStorage.getItem(LOCALE_COOKIE);
    if (isLocale(fromStorage)) return fromStorage;
  } catch {
    // ignore
  }
  return readCookieLocale();
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE,
  );

  useEffect(() => {
    setLocaleState(readStoredLocale(initialLocale));
  }, [initialLocale]);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    if (!isLocale(next)) return;
    setLocaleState(next);
    writeCookieLocale(next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: getMessages(locale),
      format: formatMessage,
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}

export function useOptionalLocale() {
  return useContext(LocaleContext);
}
