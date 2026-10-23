import { NextResponse } from 'next/server';
import { getBackendApiUrl } from '@/lib/backend-url';

/**
 * Contador aproximado de visitas (1 POST/día desde VisitTracker).
 * Siempre responde 204: un fallo de métricas no debe mostrarse como 404
 * en la consola justo después de aceptar cookies.
 */
export async function POST() {
  try {
    await fetch(`${getBackendApiUrl()}/metrics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      cache: 'no-store',
    });
  } catch {
    // best-effort
  }
  return new NextResponse(null, { status: 204 });
}
