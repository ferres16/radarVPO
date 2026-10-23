'use client';

import { useEffect } from 'react';
import { useOptionalConsent } from '@/components/consent/consent-provider';

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

      const secure =
        typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${COOKIE}=${today}; Path=/; Max-Age=172800; SameSite=Lax${secure}`;
      void fetch('/api/metrics/visit', {
        method: 'POST',
        credentials: 'include',
      }).catch(() => undefined);
    } catch {
      // No bloqueamos la página si falla la métrica.
    }
  }, [analyticsAllowed]);

  return null;
}
