/**
 * Normalización/validación de móvil para avisos SMS (alineada con el backend).
 * Acepta +internacional, 00…, 34XXXXXXXXX o 9 dígitos españoles 6–9.
 */
export function normalizePhoneForSms(phone?: string | null): string | null {
  if (!phone) return null;

  const compact = phone.replace(/[\s().-]/g, '');
  if (!compact) return null;

  if (compact.startsWith('+')) {
    return /^\+[1-9]\d{7,14}$/.test(compact) ? compact : null;
  }

  if (compact.startsWith('00')) {
    const international = `+${compact.slice(2)}`;
    return /^\+[1-9]\d{7,14}$/.test(international) ? international : null;
  }

  if (/^34[6-9]\d{8}$/.test(compact)) {
    return `+${compact}`;
  }

  if (/^[6-9]\d{8}$/.test(compact)) {
    return `+34${compact}`;
  }

  return null;
}

export function isValidSmsPhone(phone?: string | null): boolean {
  return Boolean(normalizePhoneForSms(phone));
}
