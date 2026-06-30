import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { buildBackendProxyHeaders } from '@/lib/backend-proxy-headers';

describe('buildBackendProxyHeaders', () => {
  it('sets x-client-origin from the browser origin header', () => {
    const request = new NextRequest('https://radar-vpo-frontend-ten.vercel.app/api/backend/users/me', {
      headers: {
        origin: 'https://radar-vpo-frontend-ten.vercel.app',
        cookie: 'access_token=test',
      },
    });

    const headers = buildBackendProxyHeaders(request);

    expect(headers.get('x-client-origin')).toBe('https://radar-vpo-frontend-ten.vercel.app');
    expect(headers.get('cookie')).toBe('access_token=test');
    expect(headers.get('origin')).toBeNull();
  });

  it('falls back to referer when origin is missing', () => {
    const request = new NextRequest('https://radar-vpo-frontend-ten.vercel.app/api/backend/users/me', {
      headers: {
        referer: 'https://radar-vpo-frontend-ten.vercel.app/admin/users',
      },
    });

    const headers = buildBackendProxyHeaders(request);

    expect(headers.get('x-client-origin')).toBe('https://radar-vpo-frontend-ten.vercel.app');
  });
});
