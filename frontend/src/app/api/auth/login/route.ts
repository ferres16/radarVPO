import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookiesFromBackend, clearAuthCookies } from '@/lib/auth-cookies';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const upstream = await fetch(`${getBackendApiUrl()}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  const response = NextResponse.json(data, { status: upstream.status });

  if (upstream.ok) {
    applyAuthCookiesFromBackend(upstream, response);
  }

  return response;
}
