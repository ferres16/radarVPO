import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalDocument, LegalSection, OwnerIdentity } from '@/components/legal-document';
import { adsConfig } from '@/lib/ads';
import { supportEmail } from '@/lib/legal';
import { createMetadata } from '@/lib/seo';

export const metadata: Metadata = createMetadata({
  title: 'Política de cookies',
  description:
    'Qué cookies utiliza Radar VPO, cuáles son necesarias y cómo puedes aceptar o rechazar las de analítica y publicidad.',
  path: '/cookies',
});

export default function CookiesPage() {
  return (
    <LegalDocument
      badge="Cookies"
      title="Política de cookies"
      description="Qué tecnologías usamos, cuáles son necesarias y cómo puedes decidir sobre analítica y publicidad."
      updatedAt="29 de octubre de 2026"
    >
      <LegalSection title="1. Responsable">
        <OwnerIdentity />
      </LegalSection>

      <LegalSection title="2. Qué son las cookies">
        <p>
          Las cookies y tecnologías similares son pequeños archivos o identificadores que se almacenan en tu
          dispositivo para hacer funcionar la web, recordar una elección o, si lo consientes, medir el uso. Esta
          política se ajusta a la guía de cookies de la Agencia Española de Protección de Datos y al artículo 22.2
          de la LSSI.
        </p>
      </LegalSection>

      <LegalSection title="3. Cookies necesarias (no requieren consentimiento)">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Sesión:</strong> <code>access_token</code>,{' '}
            <code>refresh_token</code> y <code>session_id</code>. Permiten iniciar sesión y mantenerla. Son HttpOnly y
            las gestiona el servidor.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Preferencia de cookies:</strong> <code>rv_consent</code>. Recuerda si
            aceptaste o rechazaste analítica y publicidad (hasta 13 meses).
          </li>
        </ul>
        <p>
          Estas cookies son técnicas: hacen falta para prestar el servicio solicitado o para guardar tu elección de
          cookies.
        </p>
      </LegalSection>

      <LegalSection title="4. Analítica (solo con consentimiento)">
        <p>
          Si aceptas, se cargan Google Analytics 4 (gtag, propiedad <code>G-EQPBRQLPQ6</code>), Vercel Analytics y,
          una vez al día, una cookie de primera parte <code>rv_visit_day</code> (48 horas) para un contador aproximado
          de visitas. No enviamos nombres, correos ni teléfonos en esos eventos. Sin consentimiento no se instalan ni
          se envía la visita.
        </p>
      </LegalSection>

      <LegalSection title="5. Publicidad y medición de campañas">
        <p>
          Si aceptas esta categoría, se carga el Meta Pixel (Facebook/Instagram Ads, id{' '}
          <code>1303653491853194</code>) para medir visitas y conversiones de campañas. Meta puede usar cookies propias
          y de terceros.
        </p>
        {adsConfig.enabled ? (
          <p>
            También se carga Google AdSense. Google puede usar cookies propias y de terceros para mostrar anuncios,
            medir su rendimiento y, en su caso, personalizarlos. AdSense no se incluye en registro, inicio de sesión,
            checkout ni área privada.
          </p>
        ) : (
          <p>
            Google AdSense puede activarse más adelante en páginas públicas; solo se cargará con el mismo consentimiento
            de publicidad y fuera de registro, login, checkout y área privada.
          </p>
        )}
        <p>Si rechazas esta categoría, no se cargan el Meta Pixel ni AdSense.</p>
      </LegalSection>

      <LegalSection title="6. Otras tecnologías de terceros">
        <p>
          Las fuentes de la web se sirven desde el propio sitio. Los vídeos de lecciones pueden usar YouTube (dominio
          youtube-nocookie) cuando abres ese contenido. El pago se realiza en Stripe, fuera de esta web, con las
          cookies que Stripe necesite para completar el cobro.
        </p>
      </LegalSection>

      <LegalSection title="7. Cómo cambiar tu elección">
        <p>
          En el aviso de cookies puedes aceptar, rechazar las no necesarias o configurar cada finalidad. El rechazo
          aparece en la misma capa y con la misma visibilidad que la aceptación. También puedes repetir la elección
          desde el pie de página («Gestionar cookies»). Más información en la{' '}
          <Link href="/privacidad" className="font-semibold text-[var(--green-700)]">
            política de privacidad
          </Link>{' '}
          o en{' '}
          <a href={`mailto:${supportEmail}`} className="font-semibold text-[var(--green-700)] underline">
            {supportEmail}
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
