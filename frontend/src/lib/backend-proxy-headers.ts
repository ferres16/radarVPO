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

  return headers;
}
