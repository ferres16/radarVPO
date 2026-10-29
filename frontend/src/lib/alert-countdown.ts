function startOfUtcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function parseAlertDate(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getDaysRemaining(estimatedPublicationDate?: string | null, now = new Date()) {
  const estimatedDate = parseAlertDate(estimatedPublicationDate);
  if (!estimatedDate) return null;

  const dayDifference = startOfUtcDay(estimatedDate) - startOfUtcDay(now);
  return Math.trunc(dayDifference / (24 * 60 * 60 * 1000));
}

export function shouldShowAlert(daysRemaining: number | null) {
  return daysRemaining !== null && daysRemaining >= -7;
}

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' });

export function formatEstimatedDate(value?: string | null) {
  const parsed = parseAlertDate(value);
  return parsed ? dateFormatter.format(parsed) : null;
}

/**
 * Texto de una fecha ESTIMADA de publicación. Nunca devuelve cifras negativas ni
 * "retraso": si la fecha ya pasó, se dice que no hay publicación oficial confirmada.
 */
export function describeEstimate(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'Sin días estimados disponibles';
  if (daysRemaining > 1) return `${daysRemaining} días estimados restantes`;
  if (daysRemaining === 1) return '1 día estimado restante';
  if (daysRemaining === 0) return 'Hoy es el día estimado';
  return 'La estimación ya pasó y todavía no consta la publicación oficial';
}
