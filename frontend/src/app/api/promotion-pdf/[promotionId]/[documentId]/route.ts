import { promises as dns } from 'node:dns';
import { NextRequest, NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend-url';
import {
  buildPdfFileName,
  isBlockedHostname,
  isBlockedResolvedAddress,
  isPdfDocument,
  isSafePdfUrl,
} from '@/lib/promotion-documents';
import type { PromotionDetail } from '@/types';

// Proxy de solo lectura para los PDF oficiales de una promoción.
// - Solo sirve documentos asociados a esa promoción en la base de datos (la URL nunca viene del cliente).
// - Solo https y DNS a IP pública; revalida cada redirección.

export const dynamic = 'force-dynamic';

const UPSTREAM_TIMEOUT_MS = 25_000;
const MAX_REDIRECTS = 3;
const MAX_BYTES = 60 * 1024 * 1024;

type RouteContext = {
  params: Promise<{ promotionId: string; documentId: string }>;
};

function errorResponse(status: number, code: string) {
  return NextResponse.json(
    { error: code },
    { status, headers: { 'Cache-Control': 'no-store' } },
  );
}

async function isPublicHttpsTarget(raw: string): Promise<boolean> {
  if (!isSafePdfUrl(raw)) return false;
  let hostname: string;
  try {
    hostname = new URL(raw).hostname;
  } catch {
    return false;
  }
  if (isBlockedHostname(hostname)) return false;
  try {
    const records = await dns.lookup(hostname, { all: true });
    if (records.length === 0) return false;
    return records.every((record) => !isBlockedResolvedAddress(record.address));
  } catch {
    return false;
  }
}

async function fetchUpstream(startUrl: string, range: string | null) {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    if (!(await isPublicHttpsTarget(current))) return null;
    const response = await fetch(current, {
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      headers: {
        Accept: 'application/pdf,*/*;q=0.8',
        'User-Agent': 'RadarVPO-DocumentViewer/1.0',
        ...(range ? { Range: range } : {}),
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return null;
      current = new URL(location, current).toString();
      continue;
    }
    return response;
  }
  return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { promotionId, documentId } = await context.params;

  let promotion: PromotionDetail | null = null;
  try {
    const backendResponse = await fetch(
      `${getBackendApiUrl()}/promotions/${encodeURIComponent(promotionId)}`,
      { cache: 'no-store', signal: AbortSignal.timeout(10_000) },
    );
    if (backendResponse.status === 404) return errorResponse(404, 'not_found');
    if (!backendResponse.ok) return errorResponse(502, 'backend_unavailable');
    promotion = (await backendResponse.json()) as PromotionDetail;
  } catch {
    return errorResponse(502, 'backend_unavailable');
  }

  const document = promotion.documents?.find(
    (item) => item.id === documentId && item.isPublic !== false,
  );
  if (!document || !isPdfDocument(document) || !isSafePdfUrl(document.publicUrl)) {
    return errorResponse(404, 'document_not_found');
  }

  const range = request.headers.get('range');
  let upstream: Response | null = null;
  try {
    upstream = await fetchUpstream(document.publicUrl, range);
  } catch {
    return errorResponse(504, 'source_timeout');
  }
  if (!upstream) return errorResponse(502, 'source_unavailable');
  if (!upstream.ok && upstream.status !== 206) {
    return errorResponse(upstream.status === 404 ? 404 : 502, 'source_unavailable');
  }

  const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? '';
  if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
    return errorResponse(502, 'source_not_pdf');
  }
  const contentLength = Number(upstream.headers.get('content-length') ?? 0);
  if (contentLength > MAX_BYTES) return errorResponse(413, 'document_too_large');

  const download = request.nextUrl.searchParams.get('download') === '1';
  const fileName = buildPdfFileName(
    document.originalName ? decodeURIComponentSafe(document.originalName) : promotion.title,
  );
  const headers = new Headers({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    'Accept-Ranges': upstream.headers.get('accept-ranges') ?? 'none',
    'Cache-Control': 'private, max-age=300',
    'X-Content-Type-Options': 'nosniff',
  });
  // Si el origen comprime la respuesta, fetch ya la descomprime y la longitud original no sirve.
  const names = upstream.headers.get('content-encoding')
    ? ['content-range']
    : ['content-length', 'content-range'];
  for (const name of names) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(upstream.body, { status: upstream.status, headers });
}

function decodeURIComponentSafe(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
