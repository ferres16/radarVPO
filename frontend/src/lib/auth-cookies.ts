import type { NextResponse } from 'next/server';

const AUTH_COOKIE_NAMES = new Set(['access_token', 'refresh_token', 'session_id']);

/**
 * Marcador legible por JS (no httpOnly). Indica que puede haber sesión.
 * Evita llamar a /users/me + /auth/refresh en visitantes anónimos (ruido 401/400 en consola).
 */
export const AUTH_SESSION_MARKER = 'rv_session';

function parseSetCookieHeader(raw: string) {
  const parts = raw.split(';').map((part) => part.trim());
  const [nameValue, ...attributes] = parts;
  const separatorIndex = nameValue.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const name = nameValue.slice(0, separatorIndex);
  const value = nameValue.slice(separatorIndex + 1);
  if (!AUTH_COOKIE_NAMES.has(name)) {
    return null;
  }

  let maxAge: number | undefined;
  for (const attribute of attributes) {
    const [key, attrValue] = attribute.split('=').map((part) => part.trim());
    if (key.toLowerCase() === 'max-age' && attrValue) {
      const parsed = Number(attrValue);
      if (Number.isFinite(parsed)) {
        maxAge = parsed;
      }
    }
  }

  return { name, value, maxAge };
}

export function applyAuthCookiesFromBackend(upstream: Response, response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production';
  const setCookieHeaders =
    typeof upstream.headers.getSetCookie === 'function'
      ? upstream.headers.getSetCookie()
      : [];

  const fallback = upstream.headers.get('set-cookie');
  if (setCookieHeaders.length === 0 && fallback) {
    setCookieHeaders.push(...fallback.split(/,(?=[^;]+?=)/));
  }

  let appliedAuth = false;
  for (const raw of setCookieHeaders) {
    const parsed = parseSetCookieHeader(raw);
    if (!parsed) continue;
    appliedAuth = true;

    response.cookies.set(parsed.name, parsed.value, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge:
        parsed.maxAge ??
        (parsed.name === 'access_token' ? 7 * 24 * 60 * 60 : 30 * 24 * 60 * 60),
    });
  }

  if (appliedAuth) {
    response.cookies.set(AUTH_SESSION_MARKER, '1', {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  const isProduction = process.env.NODE_ENV === 'production';
  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  for (const name of AUTH_COOKIE_NAMES) {
    response.cookies.set(name, '', options);
  }

  response.cookies.set(AUTH_SESSION_MARKER, '', {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
