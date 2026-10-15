'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { trackEvent, type AnalyticsEventName } from '@/lib/analytics';

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  event: AnalyticsEventName;
  eventProperties?: Record<string, string | number | boolean | null>;
};

/** Enlace interno que registra un evento de producto al hacer clic. */
export function TrackedLink({ event, eventProperties, ...props }: TrackedLinkProps) {
  return <Link {...props} onClick={() => trackEvent(event, eventProperties)} />;
}
