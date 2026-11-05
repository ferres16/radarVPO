import { NextRequest, NextResponse } from 'next/server';
import { jsonProxyHeaders } from '@/lib/backend-proxy-headers';
import { getBackendApiUrl } from '@/lib/backend-url';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const upstream = await fetch(
    `${getBackendApiUrl()}/auth/update-unverified-email`,
    {
      method: 'POST',
      headers: jsonProxyHeaders(request),
      body,
      cache: 'no-store',
    },
  );

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
