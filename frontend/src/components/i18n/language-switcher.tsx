'use client';

import { useLocale } from '@/components/i18n/locale-provider';
import { LOCALES, localeLabels, type Locale } from '@/lib/i18n/locales';

type LanguageSwitcherProps = {
  compact?: boolean;
  className?: string;
};

export function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      className={`lang-switcher${compact ? ' lang-switcher--compact' : ''} ${className}`.trim()}
      role="group"
      aria-label={t.common.language}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        const label = localeLabels[code];
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            aria-label={label.native}
            title={label.native}
            className={`lang-switcher__btn${active ? ' is-active' : ''}`}
            onClick={() => setLocale(code as Locale)}
          >
            <span className="lang-switcher__code">{label.short}</span>
            {compact ? null : <span className="lang-switcher__name">{label.native}</span>}
          </button>
        );
      })}
    </div>
  );
}
