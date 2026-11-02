/**
 * Canal WhatsApp de consultas para suscriptores PRO.
 * Configura en Vercel: NEXT_PUBLIC_PRO_WHATSAPP_NUMBER (solo dígitos, con prefijo país)
 * o NEXT_PUBLIC_PRO_WHATSAPP_URL (enlace completo wa.me / grupo).
 */

function read(value: string | undefined): string {
  return value?.trim() || '';
}

const rawNumber = read(process.env.NEXT_PUBLIC_PRO_WHATSAPP_NUMBER).replace(/[^\d]/g, '');
const rawUrl = read(process.env.NEXT_PUBLIC_PRO_WHATSAPP_URL);

export const proWhatsapp = {
  /** Hay enlace usable (número o URL). */
  available: Boolean(rawUrl || rawNumber),
  /** URL de chat (vacío si no está configurado). */
  href: rawUrl || (rawNumber ? `https://wa.me/${rawNumber}` : ''),
  label: 'WhatsApp para consultas',
  shortLabel: 'WhatsApp',
  pitch: 'Acceso a WhatsApp para consultas sobre el proceso y las promociones.',
};

export function getProWhatsappHref(prefill?: string): string {
  if (!proWhatsapp.href) return '';
  if (!prefill) return proWhatsapp.href;
  const sep = proWhatsapp.href.includes('?') ? '&' : '?';
  return `${proWhatsapp.href}${sep}text=${encodeURIComponent(prefill)}`;
}
