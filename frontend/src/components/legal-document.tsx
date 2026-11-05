import type { ReactNode } from 'react';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { isTaxIdPublished, legalOwner, supportEmail } from '@/lib/legal';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="display-type text-xl font-black text-[var(--ink)]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">{children}</div>
    </section>
  );
}

/**
 * Datos del titular en formato compacto y discreto.
 * Sigue siendo fácil de localizar y leer; no oculta información legal.
 */
export function OwnerIdentity() {
  const taxIdLabel = isTaxIdPublished() ? legalOwner.taxId : 'Pendiente de publicación';
  const addressLabel = legalOwner.address || 'Pendiente de publicación';

  return (
    <div className="mt-3 space-y-2">
      <dl className="rounded-lg border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2.5 text-[11px] leading-5 text-[var(--ink-soft)] sm:text-xs">
        <div className="flex flex-wrap gap-x-1.5">
          <dt className="font-semibold text-[var(--ink)]">Titular</dt>
          <dd>{legalOwner.name}</dd>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-1.5">
          <dt className="font-semibold text-[var(--ink)]">NIF/CIF</dt>
          <dd>{taxIdLabel}</dd>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-1.5">
          <dt className="font-semibold text-[var(--ink)]">Domicilio</dt>
          <dd>{addressLabel}</dd>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-1.5">
          <dt className="font-semibold text-[var(--ink)]">Contacto</dt>
          <dd>
            <a
              href={`mailto:${supportEmail}`}
              className="font-medium text-[var(--green-700)] underline decoration-[var(--stroke)] underline-offset-2"
            >
              {supportEmail}
            </a>
          </dd>
        </div>
      </dl>
      {!isTaxIdPublished() || !legalOwner.address ? (
        <p className="text-[11px] leading-5 text-[var(--ink-soft)]">
          El NIF y el domicilio se completarán en cuanto estén disponibles. El canal de contacto ya
          está publicado y no requiere iniciar sesión.
        </p>
      ) : null}
    </div>
  );
}

export function LegalDocument({
  badge,
  title,
  description,
  updatedAt,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <PublicPage>
      <PublicPageHero badge={badge} title={title} description={description} animated={false} />
      <PublicSection animated={false}>
        <article className="public-card mx-auto max-w-3xl p-5 md:p-8">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            Última actualización: {updatedAt}
          </p>
          {children}
        </article>
      </PublicSection>
    </PublicPage>
  );
}
