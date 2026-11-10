export function getBackendApiUrl() {
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:3000/api/v1'
  ).replace(/\/$/, '');
}

export function getBrowserApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return '/api/backend';
  }

  return getBackendApiUrl();
}

/**
 * Renderizado en servidor: identifica la petición ante el rate limit del
 * backend. BACKEND_PROXY_SECRET no lleva prefijo NEXT_PUBLIC_, así que nunca
 * llega al bundle del navegador.
 */
export function serverRenderHeaders(): Record<string, string> {
  if (typeof window !== 'undefined') return {};
  const secret = process.env.BACKEND_PROXY_SECRET;
  return secret ? { 'x-radar-proxy-secret': secret } : {};
}

/**
 * Solo para peticiones SSR ya dinámicas (con cookies de sesión): añade la IP del
 * visitante para que cada usuario tenga su propio cupo en el backend en vez de
 * compartir el de "frontend-ssr".
 */
export async function serverRenderHeadersWithClientIp(): Promise<Record<string, string>> {
  const base = serverRenderHeaders();
  if (!base['x-radar-proxy-secret']) return base;
  const { headers } = await import('next/headers');
  const incoming = await headers();
  const clientIp =
    incoming.get('x-real-ip')?.trim() ||
    incoming.get('x-forwarded-for')?.split(',')[0]?.trim();
  return clientIp ? { ...base, 'x-radar-client-ip': clientIp } : base;
}
