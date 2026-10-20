'use client';

import { useEffect } from 'react';
import { useOptionalConsent } from '@/components/consent/consent-provider';
import { getBrowserApiBaseUrl } from '@/lib/backend-url';

const COOKIE = 'rv_visit_day';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/** Cuenta un visitante único aproximado (una vez por navegador y día). */
export function VisitTracker() {
  const consent = useOptionalConsent();
  const analyticsAllowed = Boolean(consent?.preferences?.analytics);

  useEffect(() => {
    try {
      if (!analyticsAllowed) return;
      if (typeof document === 'undefined') return;
      const today = todayKey();
      const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
      if (match?.[1] === today) return;

      document.cookie = `${COOKIE}=${today}; path=/; max-age=172800; SameSite=Lax`;
      void fetch(`${getBrowserApiBaseUrl()}/metrics/visit`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      }).catch(() => undefined);
    } catch {
      // No bloqueamos la página si falla la métrica.
    }
  }, [analyticsAllowed]);

  return null;
}
