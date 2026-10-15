import type { ReactNode } from 'react';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { isLegalIdentityComplete, legalOwner, supportEmail } from '@/lib/legal';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="display-type text-xl font-black text-[var(--ink)]">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">{children}</div>
    </section>
  );
}

export function OwnerIdentity() {
  if (!isLegalIdentityComplete()) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
        Los datos identificativos del titular todavía no están publicados. Para cualquier consulta sobre una compra
        {supportEmail ? ` escribe a ${supportEmail}.` : ' utiliza el formulario de contacto de tu cuenta.'}
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      <li>
        <strong className="text-[var(--ink)]">Titular:</strong> {legalOwner.name}
      </li>
      <li>
        <strong className="text-[var(--ink)]">NIF/CIF:</strong> {legalOwner.taxId}
      </li>
      <li>
        <strong className="text-[var(--ink)]">Domicilio:</strong> {legalOwner.address}
      </li>
      <li>
        <strong className="text-[var(--ink)]">Contacto:</strong> {supportEmail}
      </li>
    </ul>
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
