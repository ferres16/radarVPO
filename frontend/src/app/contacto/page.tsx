import type { Metadata } from 'next';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { SUPPORT_SCOPE, legalOwner, supportEmail } from '@/lib/legal';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Contacto',
  description: 'Canal de contacto de Radar VPO para compras, acceso, facturación y derechos. No hace falta iniciar sesión.',
  path: '/contacto',
});

export default function ContactPage() {
  return (
    <LegalDocument
      badge="Contacto"
      title="Contacto"
      description="Un canal real, accesible sin cuenta, para compras, acceso, derechos y reclamaciones."
      updatedAt="20 de octubre de 2026"
    >
      <LegalSection title="Cómo escribirnos">
        <p>
          El titular es {legalOwner.name}. Escríbenos a{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>
          . Atendemos {SUPPORT_SCOPE}, el ejercicio de derechos y las solicitudes de devolución.
        </p>
        <p>No hace falta iniciar sesión. Indica el correo de tu cuenta si la consulta se refiere a una compra.</p>
      </LegalSection>

      <LegalSection title="Identificación">
        <OwnerIdentity />
      </LegalSection>
    </LegalDocument>
  );
}
