import { NextResponse } from 'next/server';
import { adsTxtContent } from '@/lib/ads';

export function GET() {
  return new NextResponse(adsTxtContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
