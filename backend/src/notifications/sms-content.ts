/**
 * Composición segura de SMS.
 *
 * Un solo carácter fuera de GSM-7 (p. ej. "ó") obliga a codificar todo el SMS
 * en UCS-2 (70 caracteres por segmento). Con una URL de ~60 caracteres eso
 * dejaba el texto en "Radar..." — por eso aquí transliteramos a GSM-7 y
 * validamos el resultado antes de enviarlo.
 */

const GSM7_BASIC = new Set(
  Array.from(
    '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà',
  ),
);
const GSM7_EXTENDED = new Set(Array.from('^{}\\[~]|€'));

const PUNCTUATION_MAP: Record<string, string> = {
  '\u2018': "'",
  '\u2019': "'",
  '\u00B4': "'",
  '`': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u00AB': '"',
  '\u00BB': '"',
  '\u2013': '-',
  '\u2014': '-',
  '\u2026': '...',
  '\u00B7': '.',
  '\u2022': '-',
  '\u00A0': ' ',
};

export const SMS_SINGLE_SEGMENT = 160;
export const SMS_MULTI_SEGMENT = 153;
export const SMS_DEFAULT_MAX_SEGMENTS = 2;
const MIN_BODY_CHARS = 20;

/** Pasa el texto a GSM-7 conservando ñ/Ñ y quitando tildes (ó → o, ç → c). */
export function toGsm7(text: string): string {
  let out = '';
  for (const char of Array.from(text)) {
    const mapped = PUNCTUATION_MAP[char];
    if (mapped !== undefined) {
      out += mapped;
      continue;
    }
    if (char === 'ñ' || char === 'Ñ') {
      out += char;
      continue;
    }
    const stripped = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const part of Array.from(stripped)) {
      if (GSM7_BASIC.has(part) || GSM7_EXTENDED.has(part)) {
        out += part;
      }
    }
  }
  return out.replace(/[ \t]{2,}/g, ' ');
}

export function gsm7Units(text: string): number {
  let units = 0;
  for (const char of Array.from(text)) {
    units += GSM7_EXTENDED.has(char) ? 2 : 1;
  }
  return units;
}

export function smsSegments(units: number): number {
  if (units <= 0) return 0;
  if (units <= SMS_SINGLE_SEGMENT) return 1;
  return Math.ceil(units / SMS_MULTI_SEGMENT);
}

function maxUnitsFor(segments: number): number {
  return segments <= 1 ? SMS_SINGLE_SEGMENT : segments * SMS_MULTI_SEGMENT;
}

function truncateToUnits(text: string, maxUnits: number): string {
  let units = 0;
  let out = '';
  for (const char of Array.from(text)) {
    const cost = GSM7_EXTENDED.has(char) ? 2 : 1;
    if (units + cost > maxUnits) break;
    units += cost;
    out += char;
  }
  return out;
}

export type PreparedSms = {
  ok: boolean;
  content: string;
  units: number;
  segments: number;
  encoding: 'GSM-7';
  truncated: boolean;
  /** Motivo por el que NO debe enviarse (ok=false). */
  reason?: string;
};

/**
 * Construye "<texto> <url>" en GSM-7 dentro de `maxSegments` segmentos.
 * Si el texto no cabe se recorta por palabras; si queda sin sentido
 * (demasiado corto o sin los fragmentos obligatorios) devuelve ok=false.
 */
export function prepareSms(
  body: string,
  url: string,
  options: { maxSegments?: number; requiredFragments?: string[] } = {},
): PreparedSms {
  const maxUnits = maxUnitsFor(options.maxSegments ?? SMS_DEFAULT_MAX_SEGMENTS);
  const cleanUrl = toGsm7(url.trim());
  const cleanBody = toGsm7(body.replace(/\s+/g, ' ').trim());
  const urlUnits = cleanUrl ? gsm7Units(cleanUrl) + 1 : 0;

  let text = cleanBody;
  let truncated = false;
  if (gsm7Units(cleanBody) + urlUnits > maxUnits) {
    truncated = true;
    const budget = Math.max(0, maxUnits - urlUnits - 3);
    const cut = truncateToUnits(cleanBody, budget);
    const atWord = cut.includes(' ') ? cut.slice(0, cut.lastIndexOf(' ')) : cut;
    text = `${atWord.replace(/[\s,;:.-]+$/, '')}...`;
  }

  const content = cleanUrl ? `${text} ${cleanUrl}`.trim() : text;
  const units = gsm7Units(content);
  const result: PreparedSms = {
    ok: true,
    content,
    units,
    segments: smsSegments(units),
    encoding: 'GSM-7',
    truncated,
  };

  const meaningful = text.replace(/\.\.\.$/, '').trim();
  if (meaningful.length < MIN_BODY_CHARS) {
    return { ...result, ok: false, reason: 'sms_body_too_short' };
  }
  for (const fragment of options.requiredFragments ?? []) {
    const needle = toGsm7(fragment).trim().toLowerCase();
    if (needle && !content.toLowerCase().includes(needle)) {
      return { ...result, ok: false, reason: 'sms_missing_required_text' };
    }
  }
  if (units > maxUnits) {
    return { ...result, ok: false, reason: 'sms_too_long' };
  }
  return result;
}
