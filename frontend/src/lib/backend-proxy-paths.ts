const BLOCKED_PATHS = [/^billing\/webhook(?:\/|$)/i, /^jobs(?:\/|$)/i];

/** Rutas del backend que no deben atravesar el proxy público de Next.js. */
export function isBlockedBackendProxyPath(pathParts: string[]): boolean {
  const joined = pathParts.filter(Boolean).join('/');
  return BLOCKED_PATHS.some((pattern) => pattern.test(joined));
}
