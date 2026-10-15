'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { trackEvent, type AnalyticsEventName } from '@/lib/analytics';

type TrackedLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  event: AnalyticsEventName;
  eventProperties?: Record<string, string | number | boolean | null>;
};

/** Enlace interno que registra un evento de producto al hacer clic. */
export function TrackedLink({ event, eventProperties, ...props }: TrackedLinkProps) {
  return <Link {...props} onClick={() => trackEvent(event, eventProperties)} />;
}

export function TrackedButtonLink({
  href,
  children,
  event,
  eventProperties,
  variant = 'primary',
  size = 'md',
  block = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  event: AnalyticsEventName;
  eventProperties?: Record<string, string | number | boolean | null>;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  block?: boolean;
  className?: string;
}) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn--primary' : 'btn--secondary',
    size === 'lg' ? 'btn--lg' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <TrackedLink href={href} className={classes} event={event} eventProperties={eventProperties}>
      {children}
    </TrackedLink>
  );
}
