import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adsTxtContent } from '@/lib/ads';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/ads.txt') {
    return new NextResponse(adsTxtContent, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/ads.txt',
};
