export const PRODUCTION_SITE_URL = 'https://www.radarvpo.com';

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, '');
}

export function resolvePublicSiteUrl(
  env: NodeJS.Dict<string> = process.env,
): string {
  const explicit = env.PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return stripTrailingSlash(explicit);
  }

  const frontend = env.FRONTEND_URL?.trim();
  if (frontend && /vercel\.app/i.test(frontend)) {
    return PRODUCTION_SITE_URL;
  }

  if (frontend) {
    return stripTrailingSlash(frontend);
  }

  return PRODUCTION_SITE_URL;
}
