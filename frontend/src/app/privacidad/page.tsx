import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { adsConfig } from '@/lib/ads';
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
      updatedAt="29 de octubre de 2026"
    >
      <LegalSection title="1. Responsable del tratamiento">
        <OwnerIdentity />
        <p>
          Puedes escribir a{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>{' '}
          o usar la página de{' '}
          <Link href="/contacto" className="font-semibold text-[var(--green-700)]">
            contacto
          </Link>
          . No hace falta iniciar sesión.
        </p>
      </LegalSection>

      <LegalSection title="2. Finalidades y bases jurídicas">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Cuenta:</strong> nombre y correo para crear y gestionar el
            acceso. Base jurídica: ejecución del contrato. El nombre sirve para dirigirnos a ti; no exigimos
            apellidos.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Contraseña:</strong> se guarda como hash irreversible (bcrypt),
            no como cifrado reversible. Base jurídica: ejecución del contrato y seguridad del servicio.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Móvil:</strong> solo si lo añades para recibir SMS de Radar VPO
            PRO. No es necesario para crear una cuenta gratuita. Base jurídica: ejecución del contrato de la
            suscripción.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Uso del servicio:</strong> promociones guardadas, notas, lista de
            pasos y progreso en las guías. Base jurídica: ejecución del contrato.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Compras y suscripción:</strong> producto, importe, fecha, estado
            del pago y evidencias de aceptación de condiciones. Los datos de tarjeta los trata Stripe; Radar VPO no
            los almacena. Base jurídica: contrato y obligación legal de facturación.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Avisos contratados (PRO):</strong> correo y, si lo has indicado,
            móvil. Son comunicaciones del servicio (nuevas promociones detectadas), no marketing publicitario. No
            hay SMS de marketing para cuentas gratis ni de pago. Base jurídica: ejecución del contrato.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Novedades por email (opcional):</strong> solo si marcas el
            consentimiento en el registro o lo activas en Mi cuenta. Son contenidos educativos o novedades del
            producto, distintos de los avisos PRO. Puedes retirarlo en cualquier momento. Base jurídica:
            consentimiento.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Medición y publicidad:</strong> Google Analytics 4, Vercel
            Analytics, el contador propio de visitas, Meta Pixel (campañas en Facebook/Instagram)
            {adsConfig.enabled ? ' y Google AdSense en páginas públicas' : ''}
            . Solo si aceptas esas cookies. Base jurídica: consentimiento. Detalle en la{' '}
            <Link href="/cookies" className="font-semibold text-[var(--green-700)]">
              política de cookies
            </Link>
            .
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Destinatarios y transferencias">
        <p>Solo con quienes prestan un servicio necesario para operar Radar VPO. No vendemos tus datos.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Stripe: pagos, facturas y portal de facturación.</li>
          <li>Brevo: envío de emails transaccionales y, si hay móvil, SMS de avisos PRO.</li>
          <li>Alojamiento: frontend en Vercel y API y base de datos en Railway.</li>
          <li>Almacenamiento de archivos: Amazon S3 (documentos y material de cursos).</li>
          <li>Google Analytics (Google Ireland / Google LLC): solo si consientes cookies de analítica.</li>
          <li>Meta Platforms (Meta Pixel): solo si consientes cookies de publicidad / campañas.</li>
          {adsConfig.enabled ? <li>Google AdSense: solo si consientes cookies de publicidad.</li> : null}
          <li>Vercel Analytics: solo si consientes cookies de analítica.</li>
          <li>
            Proveedores de IA y OCR (OpenAI, Azure OpenAI, Anthropic, OCR.Space): tratan documentos oficiales de
            promociones para extraer datos públicos, no tu cuenta.
          </li>
        </ul>
        <p>
          Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo. En ese caso se
          aplican las garantías que cada proveedor publique (cláusulas contractuales tipo u otras).
        </p>
      </LegalSection>

      <LegalSection title="4. Conservación">
        <ul className="list-disc space-y-1 pl-5">
          <li>Cuenta: mientras esté activa.</li>
          <li>
            Si eliminas la cuenta: anonimizamos identidad, teléfono y acceso. Conservamos los registros de compra
            durante los plazos legales de facturación y tributación.
          </li>
          <li>Sesiones y tokens de recuperación: caducan de forma automática.</li>
          <li>Consentimiento de cookies: hasta 13 meses.</li>
          <li>Contador de visitas: cookie de un día, si has aceptado analítica.</li>
          <li>
            Evidencia de compra y consentimiento contractual (versión/texto aceptados, estado de email de
            confirmación, aperturas efectivas de contenido): plazos de obligaciones legales de consumo, facturación y
            defensa frente a reclamaciones; no usamos Meta ni Google Analytics como prueba contractual.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Cómo ejercer tus derechos">
        <p>
          Puedes acceder, rectificar, suprimir, oponerte, limitar el tratamiento y solicitar la portabilidad. Desde{' '}
          <Link href="/account" className="font-semibold text-[var(--green-700)]">
            Mi cuenta
          </Link>{' '}
          puedes editar tus datos, gestionar el consentimiento de novedades por email, descargar una copia o
          solicitar la eliminación. También puedes escribir a{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>{' '}
          sin iniciar sesión, o usar{' '}
          <Link href="/contacto" className="font-semibold text-[var(--green-700)]">
            /contacto
          </Link>
          . Si consideras que no hemos atendido tus derechos, puedes reclamar ante la Agencia Española de Protección
          de Datos (aepd.es).
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
