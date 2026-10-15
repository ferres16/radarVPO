/** Solo se aceptan rutas internas como destino tras login/registro (evita open redirects). */
export function safeNextPath(value: string | null | undefined, fallback = '/account'): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
