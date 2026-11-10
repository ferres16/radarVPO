import { NextRequest, NextResponse } from 'next/server';
import { anonymousJsonProxyHeaders } from '@/lib/backend-proxy-headers';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const upstream = await fetch(`${getBackendApiUrl()}/auth/verify-email`, {
    method: 'POST',
    headers: anonymousJsonProxyHeaders(request),
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
