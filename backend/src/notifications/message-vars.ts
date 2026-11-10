import { formatEuroAmount } from '../billing/stripe-fulfillment';
import { prepareSms } from './sms-content';

const MADRID_TZ = 'Europe/Madrid';

export type MessageVars = Record<string, string>;

/** Nombre para saludo: vacío → la plantilla debe usar "Hola," vía formatGreeting. */
export function displayNameOrEmpty(
  fullName: string | null | undefined,
): string {
  const trimmed = fullName?.trim() ?? '';
  if (!trimmed) return '';
  // Evitar emails como "nombre".
  if (trimmed.includes('@')) return '';
  return trimmed;
}

/** "Hola Ana," o "Hola," si no hay nombre usable. */
export function formatGreeting(name: string): string {
  return name ? `Hola ${name},` : 'Hola,';
}

export function formatMadridDate(
  value: Date | string | null | undefined,
): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', {
    timeZone: MADRID_TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatLocation(parts: {
  municipality?: string | null;
  province?: string | null;
}): string {
  const municipality = parts.municipality?.trim() || '';
  const province = parts.province?.trim() || '';
  if (municipality && province && municipality !== province) {
    return `${municipality}, ${province}`;
  }
  return municipality || province || '';
}

export function buildBillingSummary(input: {
  kind: 'pro_monthly' | 'pro_pack_3m' | 'course';
  amountCents?: number | null;
  accessUntil?: string | null;
  /** Pack/sub: si seguirá renovándose. */
  renews?: boolean;
}): string {
  const price =
    typeof input.amountCents === 'number' && input.amountCents >= 0
      ? formatEuroAmount(input.amountCents)
      : '';

  if (input.kind === 'course') {
    return price
      ? `Importe pagado: ${price}. Compra de pago único.`
      : 'Compra de pago único.';
  }

  if (input.kind === 'pro_pack_3m') {
    const until = input.accessUntil
      ? ` Acceso PRO hasta ${input.accessUntil}.`
      : '';
    if (input.renews) {
      return `${price ? `Importe del pack: ${price}. ` : ''}El pack se renueva cada 3 meses hasta que canceles.${until}`.trim();
    }
    return `${price ? `Importe del pack: ${price}. ` : ''}Este pack no se renueva automáticamente al terminar.${until}`.trim();
  }

  return `${price ? `Importe: ${price} al mes. ` : ''}Se renueva automáticamente cada mes hasta que canceles desde Mi cuenta.`.trim();
}

/**
 * Sustituye {{var}} y aplica saludo "Hola," cuando name está vacío
 * (reemplaza "Hola {{name}}," / "Hola {{name}}").
 */
export function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * `html: true` para cuerpos de email: las variables (nombre del usuario, títulos…)
 * se escapan para que no puedan inyectar enlaces o marcado en correos enviados
 * desde nuestro dominio. Asuntos y SMS son texto plano.
 */
export function renderTemplate(
  template: string | null | undefined,
  vars: MessageVars,
  options: { html?: boolean } = {},
): string {
  if (!template) return '';
  const encode = options.html ? escapeHtmlText : (value: string) => value;
  const name = vars.name ?? '';
  let out = template
    .replace(/Hola\s*\{\{\s*name\s*\}\}\s*,?/gi, formatGreeting(encode(name)))
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
      return encode(vars[key] ?? '');
    });
  // Evitar párrafos vacíos de variables opcionales.
  out = out.replace(/<p>\s*<\/p>/gi, '');
  return out.trim();
}

/** true si tras renderizar quedan placeholders {{...}} o campos requeridos vacíos. */
export function hasIncompleteRender(
  rendered: string,
  requiredFilled: Record<string, string>,
): boolean {
  if (/\{\{[a-zA-Z0-9_]+\}\}/.test(rendered)) return true;
  for (const [key, value] of Object.entries(requiredFilled)) {
    if (!value?.trim()) {
      // access_until / billing_summary / location etc.
      void key;
      return true;
    }
  }
  return false;
}

/** SMS en GSM-7 (sin tildes) de hasta 2 segmentos; ver prepareSms. */
export function fitSmsContent(body: string, url: string): string {
  return prepareSms(body, url).content;
}
