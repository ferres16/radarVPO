export const LOCALES = ['es', 'ca'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_COOKIE = 'radar_vpo_lang';

export const localeLabels: Record<Locale, { short: string; long: string; native: string }> = {
  es: { short: 'ES', long: 'Castellano', native: 'Castellano' },
  ca: { short: 'CA', long: 'Català', native: 'Català' },
};

export function isLocale(value: unknown): value is Locale {
  return value === 'es' || value === 'ca';
}

export function parseLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  const normalized = value.trim().toLowerCase().slice(0, 2);
  return isLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

export function htmlLang(locale: Locale): string {
  return locale === 'ca' ? 'ca' : 'es';
}
