import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerRequest } from '@nestjs/throttler';
import { timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';

export const PROXY_SECRET_HEADER = 'x-radar-proxy-secret';
export const PROXY_CLIENT_IP_HEADER = 'x-radar-client-ip';

/**
 * Renderizado en servidor de Next.js sin IP del visitante: una sola cubeta
 * compartida por todo el tráfico SSR, con un límite proporcionalmente mayor.
 */
export const FRONTEND_SERVER_TRACKER = 'frontend-ssr';
export const FRONTEND_SERVER_LIMIT_MULTIPLIER = 30;

type ThrottleRequestLike = { ip?: string; headers?: Record<string, unknown> };

function headerValue(value: unknown): string {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : '';
  return typeof value === 'string' ? value : '';
}

function secretsMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isTrustedFrontendRequest(
  req: ThrottleRequestLike,
  proxySecret = process.env.BACKEND_PROXY_SECRET ?? '',
): boolean {
  if (proxySecret.length < 32) return false;
  const provided = headerValue(req.headers?.[PROXY_SECRET_HEADER]);
  return Boolean(provided) && secretsMatch(provided, proxySecret);
}

/**
 * Clave de rate limit. Todas las peticiones que pasan por los proxies de
 * Next.js comparten la IP de salida de Vercel, así que solo con el secreto
 * compartido se acepta la IP del visitante que reenvía el frontend.
 */
export function resolveClientIp(
  req: ThrottleRequestLike,
  proxySecret = process.env.BACKEND_PROXY_SECRET ?? '',
): string {
  const fallback = req.ip ?? 'unknown';
  if (!isTrustedFrontendRequest(req, proxySecret)) return fallback;
  const clientIp = headerValue(req.headers?.[PROXY_CLIENT_IP_HEADER]).trim();
  if (isIP(clientIp)) return clientIp;
  return clientIp ? fallback : FRONTEND_SERVER_TRACKER;
}

@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve(resolveClientIp(req as ThrottleRequestLike));
  }

  protected async handleRequest(
    requestProps: ThrottlerRequest,
  ): Promise<boolean> {
    const { req } = this.getRequestResponse(requestProps.context);
    const tracker = resolveClientIp(req as ThrottleRequestLike);
    if (tracker === FRONTEND_SERVER_TRACKER) {
      return super.handleRequest({
        ...requestProps,
        limit: requestProps.limit * FRONTEND_SERVER_LIMIT_MULTIPLIER,
      });
    }
    return super.handleRequest(requestProps);
  }
}
