'use client';

import Link from 'next/link';
import { ButtonLink } from '@/components/design-system';
import { ProCta, ProGate } from '@/components/pro/pro-cta';

export function PublicHeroProActions({
  secondaryHref = '/register',
  secondaryLabel = 'Crear cuenta gratis',
}: {
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="lp-hero__actions lp-hero__actions--stack">
      <ProCta size="lg" block />
      <ButtonLink href={secondaryHref} variant="secondary" size="lg" block>
        {secondaryLabel}
      </ButtonLink>
    </div>
  );
}

export function PublicInlineProCta({ size = 'lg' }: { size?: 'md' | 'lg' }) {
  return <ProCta size={size} />;
}

export function PublicProSection({
  secondaryHref = '/register?intent=pro',
  secondaryLabel = 'Crear cuenta',
}: {
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <ProGate>
      <div className="mt-4 flex flex-wrap gap-3">
        <ProCta size="lg" />
        <Link href={secondaryHref} className="btn btn--secondary btn--lg min-h-11">
          {secondaryLabel}
        </Link>
      </div>
    </ProGate>
  );
}
