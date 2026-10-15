'use client';

import { useEffect } from 'react';
import { trackEvent, type AnalyticsEventName } from '@/lib/analytics';

export function PageViewTracker({
  event,
  properties,
}: {
  event: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | null>;
}) {
  useEffect(() => {
    trackEvent(event, properties);
    // Solo una vez al montar la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
