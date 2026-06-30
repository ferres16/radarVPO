import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-cookies';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const cookie = request.headers.get('cookie') ?? '';
  const upstream = await fetch(`${getBackendApiUrl()}/auth/logout`, {
    method: 'POST',
    headers: {
      Cookie: cookie,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({ success: true }));
  const response = NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  clearAuthCookies(response);
  return response;
}
