import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookiesFromBackend, clearAuthCookies } from '@/lib/auth-cookies';
import { jsonProxyHeaders } from '@/lib/backend-proxy-headers';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const upstream = await fetch(`${getBackendApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: jsonProxyHeaders(request),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  const response = NextResponse.json(data, { status: upstream.status });

  if (upstream.ok) {
    applyAuthCookiesFromBackend(upstream, response);
  } else if (upstream.status === 401 || upstream.status === 400) {
    clearAuthCookies(response);
  }

  return response;
}
