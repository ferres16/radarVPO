/**
 * Canal WhatsApp de consultas para suscriptores PRO.
 * Por defecto: +34 690 76 36 93.
 * Override en Vercel: NEXT_PUBLIC_PRO_WHATSAPP_NUMBER (solo dígitos, con prefijo país)
 * o NEXT_PUBLIC_PRO_WHATSAPP_URL (enlace completo wa.me / grupo).
 */

function read(value: string | undefined): string {
  return value?.trim() || '';
}

const DEFAULT_PRO_WHATSAPP_NUMBER = '34690763693';

const rawNumber =
  read(process.env.NEXT_PUBLIC_PRO_WHATSAPP_NUMBER).replace(/[^\d]/g, '') ||
  DEFAULT_PRO_WHATSAPP_NUMBER;
const rawUrl = read(process.env.NEXT_PUBLIC_PRO_WHATSAPP_URL);

export const proWhatsappDefaultMessage =
  'Hola, soy suscriptor/a de Radar VPO PRO y tengo una duda.';

export const proWhatsapp = {
  /** Hay enlace usable (número o URL). */
  available: Boolean(rawUrl || rawNumber),
  /** URL de chat (vacío si no está configurado). */
  href: rawUrl || (rawNumber ? `https://wa.me/${rawNumber}` : ''),
  label: 'Dudas por WhatsApp',
  shortLabel: 'Dudas',
  pitch: 'Acceso a WhatsApp para consultas sobre el servicio y las promociones.',
};

export function getProWhatsappHref(prefill?: string): string {
  if (!proWhatsapp.href) return '';
  const text = prefill ?? proWhatsappDefaultMessage;
  if (!text) return proWhatsapp.href;
  const sep = proWhatsapp.href.includes('?') ? '&' : '?';
  return `${proWhatsapp.href}${sep}text=${encodeURIComponent(text)}`;
}
