'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { ButtonLink } from '@/components/design-system';
import { useOptionalProAccess } from '@/components/pro-access-provider';
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
  // While auth is resolving, prefer Stripe so logged-in users never flash /register.
  const href =
    context?.loading && proPlan.stripeLink
      ? proPlan.stripeLink
      : getProHref(Boolean(context?.me));
  const isExternal = /^https?:\/\//.test(href);
  const content = children ?? label ?? proPlan.ctaLabel;

  if (context?.hasPro) {
    return null;
  }

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        rel="noopener noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <ButtonLink href={href} size={size} block={block} variant={variant} className={className}>
      {content}
    </ButtonLink>
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
  const href =
    context?.loading && proPlan.stripeLink
      ? proPlan.stripeLink
      : getProHref(Boolean(context?.me));
  const isExternal = /^https?:\/\//.test(href);
  const content = children ?? label ?? proPlan.ctaLabel;

  if (context?.hasPro) {
    return null;
  }

  if (isExternal) {
    return (
      <a href={href} className={className} rel="noopener noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
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
