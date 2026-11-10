import type { NextRequest } from 'next/server';

const FORWARDED_REQUEST_HEADERS = ['content-type', 'accept', 'cookie'] as const;

function resolveClientOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      return new URL(origin).origin;
    } catch {
      // fall through
    }
  }

  const referer = request.headers.get('referer');
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      // fall through
    }
  }

  const proto = request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  return host ? `${proto}://${host}` : undefined;
}

const PROXY_SECRET_HEADER = 'x-radar-proxy-secret';
const PROXY_CLIENT_IP_HEADER = 'x-radar-client-ip';

/** IP del visitante según la plataforma (Vercel sobrescribe x-real-ip / x-forwarded-for). */
export function resolveClientIp(request: Pick<NextRequest, 'headers'>): string | undefined {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || undefined;
}

/**
 * Sin esto, el backend ve la IP de salida de Vercel en todas las peticiones
 * proxificadas y el rate limit por IP se comparte entre todos los visitantes.
 */
export function applyClientIpHeaders(headers: Headers, request: Pick<NextRequest, 'headers'>) {
  const secret = process.env.BACKEND_PROXY_SECRET;
  const clientIp = resolveClientIp(request);
  if (!secret || !clientIp) return headers;
  headers.set(PROXY_SECRET_HEADER, secret);
  headers.set(PROXY_CLIENT_IP_HEADER, clientIp);
  return headers;
}

export function buildBackendProxyHeaders(request: NextRequest) {
  const headers = new Headers();

  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const clientOrigin = resolveClientOrigin(request);
  if (clientOrigin) {
    // fetch() cannot set Origin/Referer (forbidden headers); backend trusts this instead.
    headers.set('x-client-origin', clientOrigin);
  }

  return applyClientIpHeaders(headers, request);
}

/** Cabeceras JSON para los proxies de /api/auth que reenvían la sesión al backend. */
export function jsonProxyHeaders(request: NextRequest) {
  const headers = buildBackendProxyHeaders(request);
  headers.set('content-type', 'application/json');
  headers.set('accept', 'application/json');
  return headers;
}

/** Cabeceras JSON sin cookies (login, registro, recuperación de contraseña). */
export function anonymousJsonProxyHeaders(request: NextRequest) {
  const headers = new Headers({
    'content-type': 'application/json',
    accept: 'application/json',
  });
  return applyClientIpHeaders(headers, request);
}
