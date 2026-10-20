const YOUTUBE_HOSTS = new Set([
  'www.youtube.com',
  'youtube.com',
  'www.youtube-nocookie.com',
  'youtube-nocookie.com',
]);

function parseHttpUrl(raw: string | null | undefined): URL | null {
  if (!raw || raw.length > 2048) return null;
  let url: URL;
  try {
    url = new URL(raw, 'https://radarvpo.invalid');
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;
  if (url.protocol === 'http:' && url.hostname !== 'localhost') return null;
  return url;
}

/** Enlaces de lección: solo https público. */
export function sanitizeHref(raw: string | null | undefined): string | null {
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== 'https:') return null;
  if (url.hostname === 'localhost' || url.hostname.endsWith('.local')) return null;
  return url.toString();
}

/** Imágenes del editor: https o rutas internas del propio sitio. */
export function sanitizeImageSrc(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\')) {
    return raw;
  }
  return sanitizeHref(raw);
}

/** Iframes de YouTube: solo youtube-nocookie / youtube. */
export function sanitizeYoutubeEmbedSrc(raw: string | null | undefined): string | null {
  const url = parseHttpUrl(raw);
  if (!url || url.protocol !== 'https:') return null;
  if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return null;
  if (!url.pathname.startsWith('/embed/')) return null;
  url.hostname = 'www.youtube-nocookie.com';
  return url.toString();
}
