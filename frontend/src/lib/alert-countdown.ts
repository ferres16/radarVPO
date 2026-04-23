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

export function formatCountdownValue(daysRemaining: number | null) {
  if (daysRemaining === null) {
    return { label: 'Sin fecha', detail: 'No hay fecha estimada' };
  }

  if (daysRemaining > 0) {
    return {
      label: String(daysRemaining),
      detail: daysRemaining === 1 ? 'día hasta la publicación' : 'días hasta la publicación',
    };
  }

  if (daysRemaining === 0) {
    return {
      label: 'Hoy',
      detail: 'La publicación estimada es hoy',
    };
  }

  return {
    label: String(daysRemaining),
    detail: Math.abs(daysRemaining) === 1 ? 'día de retraso' : 'días de retraso',
  };
}

export function formatCountdownSummary(daysRemaining: number | null) {
  if (daysRemaining === null) {
    return 'Sin fecha estimada disponible';
  }

  if (daysRemaining > 0) {
    return `Faltan ${daysRemaining} días`;
  }

  if (daysRemaining === 0) {
    return 'Hoy';
  }

  return `Retraso: ${Math.abs(daysRemaining)} días`;
}
