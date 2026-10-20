import { lookup } from 'dns/promises';
import { isIP } from 'net';

/**
 * Controles SSRF para descargas de PDF oficiales.
 * - Solo https
 * - Hosts públicos (no literales privadas)
 * - Resolución DNS IPv4/IPv6 y rechazo de rangos no enrutables
 * - Allowlist opcional de dominios oficiales
 */

const MAX_URL_LENGTH = 2048;

const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost', '.lan'];

/** Dominios oficiales habituales del Registre / Generalitat (y subdominios). */
export const OFFICIAL_PDF_HOST_SUFFIXES = [
  'registresolicitants.cat',
  'gencat.cat',
  'ajuntament.barcelona.cat',
  'barcelona.cat',
  'diba.cat',
  'amb.cat',
] as const;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

function isPrivateIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true; // ULA
  if (normalized.startsWith('fe80')) return true; // link-local
  if (normalized.startsWith('::ffff:')) {
    const v4 = normalized.slice('::ffff:'.length);
    return isPrivateIpv4(v4);
  }
  return false;
}

export function isBlockedIpAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isPrivateIpv4(ip);
  if (version === 6) return isPrivateIpv6(ip);
  return true;
}

export function parseHttpsPublicUrl(raw: string | null | undefined): URL | null {
  if (!raw || raw.length > MAX_URL_LENGTH) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (!host || host === 'localhost') return null;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return null;
  if (isIP(host)) return null; // no IPs literales
  if (!host.includes('.')) return null;
  return url;
}

export function isOfficialPdfHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return OFFICIAL_PDF_HOST_SUFFIXES.some(
    (suffix) => host === suffix || host.endsWith(`.${suffix}`),
  );
}

/**
 * Valida URL + resolución DNS. Devuelve false si el host resuelve a IP privada
 * o si requireOfficial=true y no está en la allowlist.
 */
export async function assertSafeRemotePdfUrl(
  raw: string,
  options: { requireOfficial?: boolean } = {},
): Promise<{ ok: true; url: URL } | { ok: false; reason: string }> {
  const url = parseHttpsPublicUrl(raw);
  if (!url) return { ok: false, reason: 'invalid_url' };
  if (options.requireOfficial && !isOfficialPdfHost(url.hostname)) {
    return { ok: false, reason: 'host_not_allowlisted' };
  }

  try {
    const records = await lookup(url.hostname, { all: true, verbatim: true });
    if (!records.length) return { ok: false, reason: 'dns_empty' };
    for (const record of records) {
      if (isBlockedIpAddress(record.address)) {
        return { ok: false, reason: 'private_ip' };
      }
    }
  } catch {
    return { ok: false, reason: 'dns_failed' };
  }

  return { ok: true, url };
}
