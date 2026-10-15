import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { SUPPORT_SCOPE, supportEmail } from '@/lib/legal';
import { proPlan } from '@/lib/pro';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Condiciones de contratación',
  description:
    'Condiciones de contratación de los cursos y de la suscripción Radar VPO PRO: precios, pago, acceso, cancelación y desistimiento.',
  path: '/condiciones',
});

export default function ConditionsPage() {
  return (
    <LegalDocument
      badge="Condiciones"
      title="Condiciones de contratación"
      description="Qué compras, cuánto cuesta, cómo se cobra, cómo se cancela y qué no incluye Radar VPO."
      updatedAt="15 de octubre de 2026"
    >
      <LegalSection title="1. Quién presta el servicio">
        <OwnerIdentity />
      </LegalSection>

      <LegalSection title="2. Qué ofrece Radar VPO">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Gratis:</strong> consulta de promociones de vivienda protegida y
            acceso a su documento oficial, cuenta gratuita y lección de muestra de los cursos que la tengan.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Cursos:</strong> contenido formativo digital, de pago único.
          </li>
          <li>
            <strong className="text-[var(--ink)]">{proPlan.name}:</strong> suscripción mensual con avisos por email y
            SMS de nuevas promociones, espacio personal sin límite de promociones guardadas y acceso a los cursos
            marcados como incluidos mientras la suscripción esté activa.
          </li>
        </ul>
        <p>
          Radar VPO <strong className="text-[var(--ink)]">no</strong> ofrece asesoramiento individual, revisión de tu
          documentación ni presentación de solicitudes en tu nombre. La información es orientativa: las bases y los
          documentos oficiales de cada promoción prevalecen siempre. Radar VPO no garantiza la obtención de una
          vivienda.
        </p>
      </LegalSection>

      <LegalSection title="3. Precios y pago">
        <p>
          El precio de cada producto se muestra en su página y en el resumen del pedido antes de pagar. El importe final,
          con los impuestos que correspondan, aparece en la pantalla de pago antes de confirmar. El cobro se realiza en
          euros a través de Stripe; Radar VPO no almacena los datos de tu tarjeta.
        </p>
      </LegalSection>

      <LegalSection title="4. Cursos (pago único)">
        <p>
          Pagas una sola vez, sin renovaciones. El acceso se activa automáticamente al confirmarse el pago y se mantiene
          mientras el curso siga publicado en Radar VPO. Un curso solo se pone a la venta cuando tiene contenido
          publicado suficiente; los cursos en preparación se muestran como tales y no se pueden comprar.
        </p>
      </LegalSection>

      <LegalSection title={`5. ${proPlan.name} (suscripción mensual)`}>
        <p>
          El precio es de {proPlan.price}. La suscripción se renueva automáticamente cada mes hasta que la canceles. Puedes
          cancelarla en cualquier momento desde{' '}
          <Link href="/account" className="font-semibold text-[var(--green-700)]">
            Mi cuenta
          </Link>
          : no se volverá a cobrar y conservarás el acceso hasta el final del periodo ya pagado.
        </p>
        <p>
          Los avisos cubren las promociones que Radar VPO detecta en las fuentes oficiales que monitoriza. Las fechas de
          próximos lanzamientos son estimaciones y se identifican como tales. Los SMS requieren un móvil válido en tu
          cuenta.
        </p>
      </LegalSection>

      <LegalSection title="6. Acceso inmediato y derecho de desistimiento">
        <p>
          Los cursos y la suscripción se activan de inmediato tras el pago. Antes de pagar se te pide que confirmes
          expresamente que quieres acceso inmediato.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Cursos (contenido digital):</strong> al solicitar el acceso inmediato
            con tu consentimiento expreso, reconoces que pierdes el derecho de desistimiento una vez comenzado el
            suministro del contenido.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Suscripción:</strong> si ejerces el desistimiento dentro de los 14
            días siguientes a la contratación, abonarás la parte proporcional del servicio ya disfrutado hasta ese
            momento, conforme a la normativa de consumidores.
          </li>
        </ul>
        <p>
          Para ejercer tus derechos o solicitar una devolución escribe a {supportEmail ?? 'soporte'} indicando el correo de
          tu cuenta.
        </p>
      </LegalSection>

      <LegalSection title="7. Soporte">
        <p>
          El soporte atiende incidencias de {SUPPORT_SCOPE}. No incluye asesoramiento sobre tu caso particular.
          {supportEmail ? ` Escríbenos a ${supportEmail}.` : ''}
        </p>
      </LegalSection>

      <LegalSection title="8. Cambios y disponibilidad">
        <p>
          Radar VPO puede actualizar el contenido de los cursos y las funciones del servicio. Si un cambio afecta de
          forma sustancial a lo que has contratado, se te informará. El servicio puede tener interrupciones puntuales de
          mantenimiento.
        </p>
      </LegalSection>

      <LegalSection title="9. Datos personales">
        <p>
          El tratamiento de tus datos se explica en la{' '}
          <Link href="/privacidad" className="font-semibold text-[var(--green-700)]">
            política de privacidad
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
