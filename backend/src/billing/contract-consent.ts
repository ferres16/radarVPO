/**
 * Versiones y textos inmutables de consentimiento (espejo del frontend).
 * Cambiar copy ⇒ subir versión. Las compras guardan snapshot + versión.
 */

export const CONTRACT_TERMS_VERSION = 'terms-v2026-10-30';
export const DIGITAL_IMMEDIATE_CONSENT_VERSION = 'digital-immediate-v2026-10-30';
export const PRO_IMMEDIATE_CONSENT_VERSION = 'pro-service-start-v2026-10-30';

export const CONTRACT_TERMS_TEXT =
  'He leído y acepto las condiciones de contratación y la política de privacidad de Radar VPO aplicables a esta compra.';

export const DIGITAL_IMMEDIATE_CONSENT_TEXT =
  'Solicito el inicio del suministro del contenido digital durante el plazo de desistimiento. Reconozco que, cuando comience el suministro, perderé el derecho de desistimiento respecto de este contenido (art. 103.m TRLGDCU), sin perjuicio de mis derechos por falta de conformidad o incumplimiento. Si no marco esta casilla, no puedo completar la compra con acceso inmediato: Radar VPO no ofrece actualmente entrega diferida de guías/cursos.';

export const PRO_IMMEDIATE_CONSENT_TEXT =
  'Quiero que el servicio Radar VPO PRO comience de inmediato. Entiendo que es una suscripción de pago recurrente, que puedo cancelar la renovación desde Mi cuenta y conservar el acceso hasta el final del periodo ya pagado, y que el desistimiento en 14 días (si procede) se gestiona aparte y puede implicar el abono de la parte del servicio ya disfrutada. La apertura de una guía incluida en un pack no elimina por sí sola el desistimiento de toda la suscripción.';

export function immediateConsentForProduct(
  product: 'pro' | 'pro_pack_3m' | 'course',
) {
  if (product === 'course') {
    return {
      version: DIGITAL_IMMEDIATE_CONSENT_VERSION,
      text: DIGITAL_IMMEDIATE_CONSENT_TEXT,
    };
  }
  return {
    version: PRO_IMMEDIATE_CONSENT_VERSION,
    text: PRO_IMMEDIATE_CONSENT_TEXT,
  };
}

/** Criterio técnico de “inicio efectivo del suministro” (guía/curso). */
export const CONTENT_SUPPLY_START_CRITERION =
  'Primera petición autenticada al visor PDF de la guía o a una lección del curso con acceso activo concedido. No implica lectura completa ni tiempo mínimo de visualización.';
