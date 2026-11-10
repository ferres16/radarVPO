/**
 * Plazos de conservación de datos técnicos (días). Deben coincidir con lo que
 * declara la política de privacidad; cambiarlos aquí sin actualizarla no es válido.
 * Compras, suscripciones, consentimientos y auditoría NO se purgan aquí.
 */
export const RETENTION_DAYS = {
  /** Sesiones caducadas o revocadas (refresh tokens hasheados). */
  sessions: 30,
  /** Tokens de verificación de email y de reseteo de contraseña caducados o usados. */
  authTokens: 30,
  /** Contenido de SMS/email enviados (destinatario + texto). */
  deliveryLogs: 365,
  /** Errores técnicos de envío y de jobs. */
  deliveryFailures: 180,
  /** Historial de ejecuciones de tareas programadas. */
  jobRuns: 90,
  /** Claims de idempotencia de webhooks Stripe ya procesados. */
  stripeEvents: 180,
} as const;

export function retentionCutoff(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

export function isDataRetentionEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.DATA_RETENTION_ENABLED === 'true';
}
