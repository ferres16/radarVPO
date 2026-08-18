export type ProNotifyKind =
  | 'new_alert'
  | 'new_publication'
  | 'reminder_7d'
  | 'reminder_1d';

export const PRO_NOTIFY_SOURCE_KIND: Record<ProNotifyKind, string> = {
  new_alert: 'promotion_alert',
  new_publication: 'promotion_published',
  reminder_7d: 'promotion_alert_d7',
  reminder_1d: 'promotion_alert_d1',
};

export function madridYmd(date: Date, timeZone = 'Europe/Madrid'): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function calendarDaysUntil(
  target: Date,
  now = new Date(),
  timeZone = 'Europe/Madrid',
): number {
  const [ty, tm, td] = madridYmd(target, timeZone).split('-').map(Number);
  const [ny, nm, nd] = madridYmd(now, timeZone).split('-').map(Number);
  const targetUtc = Date.UTC(ty, tm - 1, td);
  const nowUtc = Date.UTC(ny, nm - 1, nd);
  return Math.round((targetUtc - nowUtc) / (24 * 60 * 60 * 1000));
}
