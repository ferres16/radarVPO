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
