import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend-url';

// Enlace corto de los SMS: /p/<código> → /promotions/<id>.

export const dynamic = 'force-dynamic';

const SHORT_CODE_PATTERN = /^[a-z0-9]{8,16}$/;
const ID_PATTERN = /^[a-z0-9]{8,40}$/;

type RouteContext = { params: Promise<{ code: string }> };

function redirectTo(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url), 307);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { code: rawCode } = await context.params;
  const code = rawCode.trim().toLowerCase();
  if (!SHORT_CODE_PATTERN.test(code)) {
    return redirectTo(request, '/promotions');
  }

  try {
    const res = await fetch(
      `${getBackendApiUrl()}/promotions/short/${encodeURIComponent(code)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(8_000) },
    );
    if (res.ok) {
      const data = (await res.json()) as { id?: unknown };
      if (typeof data.id === 'string' && ID_PATTERN.test(data.id)) {
        return redirectTo(request, `/promotions/${data.id}`);
      }
    } else if (res.status !== 404) {
      console.error(`short link ${code}: backend responded ${res.status}`);
    }
  } catch (error) {
    console.error(`short link ${code}: backend unreachable`, error);
  }

  return redirectTo(request, '/promotions');
}
