import { isProductionAppEnv } from './app-environment';

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
  // En producción una URL *.vercel.app es la de despliegue, no la pública.
  // En pruebas sí es la pública: los enlaces no deben llevar a producción.
  if (frontend && /vercel\.app/i.test(frontend) && isProductionAppEnv(env)) {
    return PRODUCTION_SITE_URL;
  }

  if (frontend) {
    return stripTrailingSlash(frontend);
  }

  return isProductionAppEnv(env)
    ? PRODUCTION_SITE_URL
    : 'http://localhost:3001';
}
