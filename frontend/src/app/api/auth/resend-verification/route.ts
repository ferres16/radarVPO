import { NextRequest, NextResponse } from 'next/server';
import { jsonProxyHeaders } from '@/lib/backend-proxy-headers';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const upstream = await fetch(`${getBackendApiUrl()}/auth/resend-verification`, {
    method: 'POST',
    headers: jsonProxyHeaders(request),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
