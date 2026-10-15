import type { Metadata } from 'next';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { supportEmail } from '@/lib/legal';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Política de privacidad',
  description: 'Qué datos personales trata Radar VPO, para qué, con quién se comparten y cómo ejercer tus derechos.',
  path: '/privacidad',
});

export default function PrivacyPage() {
  return (
    <LegalDocument
      badge="Privacidad"
      title="Política de privacidad"
      description="Qué datos tratamos, para qué, con quién los compartimos y cómo ejercer tus derechos."
      updatedAt="15 de octubre de 2026"
    >
      <LegalSection title="1. Responsable del tratamiento">
        <OwnerIdentity />
      </LegalSection>

      <LegalSection title="2. Datos que tratamos y para qué">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Cuenta:</strong> nombre, correo y contraseña (almacenada cifrada). Para
            crear y gestionar tu cuenta y darte acceso a lo que has contratado.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Móvil (opcional):</strong> solo para enviarte los avisos por SMS de
            Radar VPO PRO.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Uso del servicio:</strong> promociones guardadas, notas, lista de pasos
            y progreso en los cursos, para prestarte esas funciones.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Compras:</strong> producto contratado, importe, fecha y estado del
            pago. Los datos de tu tarjeta los trata Stripe; Radar VPO no los almacena.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Avisos:</strong> correo y, si lo has indicado, móvil, para enviarte los
            avisos del servicio PRO y mensajes necesarios sobre tu cuenta o compra.
          </li>
        </ul>
        <p>La base jurídica es la ejecución del contrato o de tus solicitudes y, para la analítica, el interés legítimo.</p>
      </LegalSection>

      <LegalSection title="3. Con quién compartimos datos">
        <p>
          Solo con proveedores que nos prestan servicio: Stripe (pagos), Brevo (envío de emails y SMS), y proveedores de
          alojamiento e infraestructura. También se utiliza analítica de uso de la web. No vendemos tus datos.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservación">
        <p>
          Conservamos tus datos mientras mantengas la cuenta y, después, durante los plazos legales aplicables (por
          ejemplo, obligaciones fiscales y contables sobre las compras).
        </p>
      </LegalSection>

      <LegalSection title="5. Tus derechos">
        <p>
          Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento y solicitar la portabilidad de tus datos
          escribiendo a {supportEmail ?? 'el correo de soporte'}. Si consideras que no hemos atendido tus derechos, puedes
          reclamar ante la Agencia Española de Protección de Datos (aepd.es).
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
