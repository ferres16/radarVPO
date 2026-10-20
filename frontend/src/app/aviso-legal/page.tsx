import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { supportEmail } from '@/lib/legal';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Aviso legal',
  description: 'Identificación del titular de Radar VPO y condiciones de uso de la información publicada.',
  path: '/aviso-legal',
});

export default function LegalNoticePage() {
  return (
    <LegalDocument
      badge="Aviso legal"
      title="Aviso legal"
      description="Quién edita Radar VPO, cómo contactar y cómo usar la información publicada."
      updatedAt="20 de octubre de 2026"
    >
      <LegalSection title="1. Identificación del titular">
        <p>
          En cumplimiento de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico,
          se informa de los datos del prestador:
        </p>
        <OwnerIdentity />
      </LegalSection>

      <LegalSection title="2. Objeto">
        <p>
          Radar VPO informa sobre promociones de vivienda protegida, publica contenidos formativos digitales y ofrece
          una suscripción de avisos. La información de promociones es orientativa y no sustituye las bases ni los
          documentos oficiales. Radar VPO no tramita solicitudes ni garantiza la obtención de una vivienda.
        </p>
      </LegalSection>

      <LegalSection title="3. Propiedad intelectual">
        <p>
          El diseño, el software y los textos propios de Radar VPO están reservados. Los documentos oficiales de las
          promociones pertenecen a sus respectivos emisores públicos; aquí se muestran para consulta.
        </p>
      </LegalSection>

      <LegalSection title="4. Contratación y privacidad">
        <p>
          La compra de cursos y de la suscripción se rige por las{' '}
          <Link href="/condiciones" className="font-semibold text-[var(--green-700)]">
            condiciones de contratación
          </Link>
          . El tratamiento de datos personales se explica en la{' '}
          <Link href="/privacidad" className="font-semibold text-[var(--green-700)]">
            política de privacidad
          </Link>{' '}
          y en la{' '}
          <Link href="/cookies" className="font-semibold text-[var(--green-700)]">
            política de cookies
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection title="5. Contacto, idioma y reclamaciones">
        <p>
          El canal de contacto es{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>
          , también disponible en{' '}
          <Link href="/contacto" className="font-semibold text-[var(--green-700)]">
            /contacto
          </Link>{' '}
          sin iniciar sesión.
        </p>
        <p>
          La información comercial y contractual se publica en castellano. Si necesitas esa información en catalán,
          escríbenos a {supportEmail} y te la enviaremos.
        </p>
        <p>
          Puedes presentar una reclamación ante Radar VPO por el mismo correo. También puedes acudir a la Agència
          Catalana del Consum o solicitar las hojas oficiales de reclamación. Te las facilitaremos por correo si las
          pides.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
