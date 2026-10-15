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
  if (daysRemaining === null) return 'Sin fecha estimada disponible';
  if (daysRemaining > 1) return `Quedan unos ${daysRemaining} días hasta la fecha estimada`;
  if (daysRemaining === 1) return 'Queda aproximadamente 1 día hasta la fecha estimada';
  if (daysRemaining === 0) return 'Hoy es la fecha estimada';
  return 'La fecha estimada ya pasó y todavía no consta la publicación oficial';
}
