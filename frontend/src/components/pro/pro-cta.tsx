'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { TrackedButtonLink } from '@/components/tracked-link';
import { useOptionalProAccess } from '@/components/pro-access-provider';
import { trackEvent } from '@/lib/analytics';
import { getProHref, proPlan } from '@/lib/pro';

type ProCtaProps = {
  children?: ReactNode;
  className?: string;
  size?: 'md' | 'lg';
  block?: boolean;
  variant?: 'primary' | 'secondary';
  label?: string;
};

export function ProCta({
  children,
  className,
  size = 'md',
  block = false,
  variant = 'primary',
  label,
}: ProCtaProps) {
  const context = useOptionalProAccess();
  const href = getProHref();
  const content = children ?? label ?? proPlan.ctaLabel;

  if (context?.hasPro) {
    return null;
  }

  return (
    <TrackedButtonLink
      href={href}
      size={size}
      block={block}
      variant={variant}
      className={className}
      event="pro_cta_clicked"
      eventProperties={{ source: 'pro_cta' }}
    >
      {content}
    </TrackedButtonLink>
  );
}

export function ProCtaLink({
  children,
  className,
  label,
}: {
  children?: ReactNode;
  className?: string;
  label?: string;
}) {
  const context = useOptionalProAccess();
  const href = getProHref();
  const content = children ?? label ?? proPlan.ctaLabel;

  if (context?.hasPro) {
    return null;
  }

  return (
    <Link href={href} className={className} onClick={() => trackEvent('pro_cta_clicked', { source: 'nav' })}>
      {content}
    </Link>
  );
}

type ProGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function ProGate({ children, fallback = null }: ProGateProps) {
  const context = useOptionalProAccess();

  if (context?.hasPro) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function ProOnlyMessage({ children }: { children: ReactNode }) {
  const context = useOptionalProAccess();

  if (!context?.hasPro) {
    return null;
  }

  return <>{children}</>;
}
