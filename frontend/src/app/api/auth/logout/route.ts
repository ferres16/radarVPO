import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth-cookies';
import { jsonProxyHeaders } from '@/lib/backend-proxy-headers';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const upstream = await fetch(`${getBackendApiUrl()}/auth/logout`, {
    method: 'POST',
    headers: jsonProxyHeaders(request),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({ success: true }));
  const response = NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status });
  clearAuthCookies(response);
  return response;
}
