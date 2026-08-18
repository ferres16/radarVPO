export function resolveOrigin(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

function withWwwVariant(origin: string): string[] {
  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes('.') || hostname.endsWith('.localhost')) {
      return [url.origin];
    }

    const alt = new URL(url.origin);
    alt.hostname = hostname.startsWith('www.')
      ? hostname.slice(4)
      : `www.${hostname}`;
    return [...new Set([url.origin, alt.origin])];
  } catch {
    return [origin];
  }
}

export function buildAllowedOriginSet(rawOrigins: string[]): Set<string> {
  const expanded = rawOrigins.flatMap((value) => {
    const origin = resolveOrigin(value.trim()) || value.trim();
    return origin ? withWwwVariant(origin) : [];
  });

  for (const site of ['https://www.radarvpo.com', 'https://radarvpo.com']) {
    expanded.push(...withWwwVariant(site));
  }

  return new Set(expanded.filter(Boolean));
}
