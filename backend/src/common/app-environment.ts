/**
 * APP_ENV distingue producción de entornos de prueba (staging, preview…) aunque
 * todos se ejecuten con NODE_ENV=production. Sin APP_ENV se asume producción
 * para no cambiar el comportamiento de despliegues existentes.
 */
export function isProductionAppEnv(env: NodeJS.Dict<string> = process.env) {
  const appEnv = env.APP_ENV?.trim().toLowerCase();
  return !appEnv || appEnv === 'production';
}

export type MessagingAllowlist = {
  emails: Set<string>;
  domains: Set<string>;
  phones: Set<string>;
};

/**
 * Fuera de producción, si MESSAGING_ALLOWLIST está definida, solo se envían
 * emails/SMS a esos destinatarios (emails, "@dominio" o teléfonos, separados por
 * comas); definida y vacía = no se envía nada. Exigir que la variable exista
 * evita bloquear envíos reales si producción tuviera un APP_ENV heredado.
 */
export function messagingAllowlist(
  env: NodeJS.Dict<string> = process.env,
): MessagingAllowlist | null {
  if (isProductionAppEnv(env) || env.MESSAGING_ALLOWLIST === undefined) {
    return null;
  }
  const list: MessagingAllowlist = {
    emails: new Set(),
    domains: new Set(),
    phones: new Set(),
  };
  for (const raw of (env.MESSAGING_ALLOWLIST ?? '').split(',')) {
    const entry = raw.trim().toLowerCase();
    if (!entry) continue;
    if (entry.startsWith('@')) list.domains.add(entry);
    else if (entry.includes('@')) list.emails.add(entry);
    else {
      const digits = normalizePhone(entry);
      if (digits) list.phones.add(digits);
    }
  }
  return list;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.length === 9 ? `34${digits}` : digits;
}

export function isRecipientAllowed(
  target: string | undefined,
  allowlist: MessagingAllowlist | null,
): boolean {
  if (!allowlist) return true;
  const value = target?.trim().toLowerCase();
  if (!value) return false;
  if (value.includes('@')) {
    return (
      allowlist.emails.has(value) ||
      allowlist.domains.has(value.slice(value.lastIndexOf('@')))
    );
  }
  const digits = normalizePhone(value);
  return Boolean(digits) && allowlist.phones.has(digits);
}
