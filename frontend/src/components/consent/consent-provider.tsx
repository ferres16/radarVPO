'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { adsConfig } from '@/lib/ads';
import {
  ACCEPTED_CONSENT,
  CONSENT_VERSION,
  DENIED_CONSENT,
  readConsentCookie,
  subscribeConsent,
  writeConsentCookie,
  type ConsentPreferences,
} from '@/lib/consent';
import { needsMarketingConsentCategory } from '@/lib/marketing';

const marketingConsentAvailable = needsMarketingConsentCategory(adsConfig.enabled);

type ConsentContextValue = {
  preferences: ConsentPreferences | null;
  decided: boolean;
  configuring: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  save: (prefs: Pick<ConsentPreferences, 'analytics' | 'ads'>) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const preferences = useSyncExternalStore(subscribeConsent, readConsentCookie, () => null);
  const [configuring, setConfiguring] = useState(false);

  const persist = useCallback((prefs: ConsentPreferences) => {
    writeConsentCookie(prefs);
    setConfiguring(false);
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences,
      decided: preferences !== null,
      configuring,
      acceptAll: () =>
        persist({
          ...ACCEPTED_CONSENT,
          ads: marketingConsentAvailable,
        }),
      rejectNonEssential: () => persist(DENIED_CONSENT),
      save: (prefs) =>
        persist({
          v: CONSENT_VERSION,
          analytics: prefs.analytics,
          ads: marketingConsentAvailable && prefs.ads,
        }),
      openSettings: () => setConfiguring(true),
      closeSettings: () => setConfiguring(false),
    }),
    [configuring, persist, preferences],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}

export function useOptionalConsent() {
  return useContext(ConsentContext);
}
