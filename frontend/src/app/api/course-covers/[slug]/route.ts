import { NextResponse } from 'next/server';
import { getBackendCourseCoverUrl } from '@/lib/course-media-url';

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const upstream = await fetch(getBackendCourseCoverUrl(slug), {
    redirect: 'manual',
    cache: 'no-store',
  });

  if (upstream.status >= 300 && upstream.status < 400) {
    const location = upstream.headers.get('location');
    if (location) {
      return NextResponse.redirect(location, upstream.status);
    }
  }

  return new NextResponse(null, { status: upstream.status || 404 });
}
