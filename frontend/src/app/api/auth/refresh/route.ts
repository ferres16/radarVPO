import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookiesFromBackend, clearAuthCookies } from '@/lib/auth-cookies';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  const upstream = await fetch(`${getBackendApiUrl()}/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: cookie,
      Accept: 'application/json',
    },
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
