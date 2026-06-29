import { NextResponse } from 'next/server';
import { getBackendCourseMediaUrl } from '@/lib/course-media-url';

type RouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { assetId } = await context.params;
  const cookie = request.headers.get('cookie') ?? '';
  const upstream = await fetch(getBackendCourseMediaUrl(assetId), {
    headers: {
      cookie,
      accept: '*/*',
    },
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
