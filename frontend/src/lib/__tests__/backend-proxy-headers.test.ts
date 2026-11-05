import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { buildBackendProxyHeaders, jsonProxyHeaders } from '@/lib/backend-proxy-headers';

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

  it('forwards the production domain origin for same-site admin requests', () => {
    const request = new NextRequest('https://www.radarvpo.com/api/backend/backoffice/users/abc', {
      method: 'PATCH',
      headers: {
        origin: 'https://www.radarvpo.com',
        cookie: 'access_token=test',
      },
    });

    const headers = buildBackendProxyHeaders(request);

    expect(headers.get('x-client-origin')).toBe('https://www.radarvpo.com');
  });
});

describe('jsonProxyHeaders', () => {
  it('keeps session cookie and client origin for auth proxies', () => {
    const request = new NextRequest('https://www.radarvpo.com/api/auth/update-unverified-email', {
      method: 'POST',
      headers: {
        origin: 'https://www.radarvpo.com',
        cookie: 'access_token=test; refresh_token=r',
      },
    });

    const headers = jsonProxyHeaders(request);

    expect(headers.get('x-client-origin')).toBe('https://www.radarvpo.com');
    expect(headers.get('cookie')).toBe('access_token=test; refresh_token=r');
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('accept')).toBe('application/json');
  });
});
