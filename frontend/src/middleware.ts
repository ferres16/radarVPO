import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adsTxtContent } from '@/lib/ads';

const APEX_HOST = 'radarvpo.com';
const CANONICAL_HOST = 'www.radarvpo.com';

function requestHost(request: NextRequest) {
  const raw = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  return raw.split(',')[0]?.trim().toLowerCase().replace(/:\d+$/, '') ?? '';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // AdSense exige ads.txt en el apex SIN redirección (site = radarvpo.com).
  // Si Vercel redirige apex→www a nivel de dominio, este código no llega:
  // hay que quitar ese redirect en Project → Domains (ver docs/adsense-getting-ready.md).
  if (pathname === '/ads.txt') {
    return new NextResponse(adsTxtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  const host = requestHost(request);
  if (host === APEX_HOST) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  // ads.txt + resto de páginas del apex (para redirigir a www en app).
  matcher: ['/ads.txt', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
