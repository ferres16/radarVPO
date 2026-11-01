import { AUTH_SESSION_MARKER } from '@/lib/auth-cookies';

/** ¿Hay indicios de sesión en el navegador? (cookie no httpOnly). */
export function hasAuthSessionMarker(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((part) => {
    const [name, value] = part.trim().split('=');
    return name === AUTH_SESSION_MARKER && Boolean(value) && value !== '0';
  });
}

/** Marca sesión en el cliente tras un getMe exitoso (usuarios ya logueados sin marcador). */
export function markAuthSessionClient(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_SESSION_MARKER}=1; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax${secure}`;
}

export function clearAuthSessionMarkerClient(): void {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AUTH_SESSION_MARKER}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
}
