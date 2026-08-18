import type { ProNotifyKind } from './pro-notify.util';

export const PUBLICATION_UNCERTAINTY_DISCLAIMER =
  'Esta fecha es orientativa (suele calcularse hacia los 60 días). No siempre se publica exactamente entonces y a veces no llega a publicarse.';

export type ProNotifyCopy = {
  title: string;
  location: string;
  estimatedDate: string | null;
  subject: string;
  intro: string;
  ctaLabel: string;
  pageUrl: string;
  sms: string;
  disclaimer: string | null;
};

const SMS_MAX_LENGTH = 160;

export function buildSmsWithUrl(body: string, url: string, max = SMS_MAX_LENGTH) {
  const reserved = url.length + 1;
  const budget = Math.max(0, max - reserved);
  const trimmed =
    body.length > budget ? `${body.slice(0, Math.max(0, budget - 3)).trimEnd()}...` : body;
  return `${trimmed} ${url}`.slice(0, max);
}

export function buildProNotifyCopy(input: {
  kind: ProNotifyKind;
  title: string;
  location: string;
  estimatedDate: string | null;
  alertsUrl: string;
  promotionsUrl: string;
}): ProNotifyCopy {
  const { kind, title, location, estimatedDate, alertsUrl, promotionsUrl } = input;

  if (kind === 'new_publication') {
    return {
      title,
      location,
      estimatedDate,
      subject: `Nueva promoción VPO publicada: ${title}`.slice(0, 140),
      intro: 'Hay una <strong>nueva promoción publicada</strong> en Radar VPO PRO.',
      ctaLabel: 'Ver ficha',
      pageUrl: promotionsUrl,
      sms: buildSmsWithUrl(
        `Radar VPO PRO: nueva promoción publicada en ${location}.`,
        promotionsUrl,
      ),
      disclaimer: null,
    };
  }

  if (kind === 'reminder_7d') {
    return {
      title,
      location,
      estimatedDate,
      subject: `Queda ~1 semana (fecha estimada): ${title}`.slice(0, 140),
      intro:
        'Queda <strong>alrededor de 1 semana</strong> para la fecha <strong>estimada</strong> de este lanzamiento. Esa fecha no está confirmada: no siempre se publica a los 60 días y a veces no se acaba publicando.',
      ctaLabel: 'Ver próximos lanzamientos',
      pageUrl: alertsUrl,
      sms: buildSmsWithUrl(
        `Radar VPO PRO: ~1 semana (fecha estimada, puede no publicarse) en ${location}.`,
        alertsUrl,
      ),
      disclaimer: PUBLICATION_UNCERTAINTY_DISCLAIMER,
    };
  }

  if (kind === 'reminder_1d') {
    return {
      title,
      location,
      estimatedDate,
      subject: `Fecha estimada mañana: ${title}`.slice(0, 140),
      intro:
        'Mañana es la fecha <strong>estimada</strong> de este lanzamiento. No siempre se publica exactamente entonces y a veces no llega a publicarse.',
      ctaLabel: 'Ver próximos lanzamientos',
      pageUrl: alertsUrl,
      sms: buildSmsWithUrl(
        `Radar VPO PRO: mañana es fecha estimada en ${location}. Puede no publicarse.`,
        alertsUrl,
      ),
      disclaimer: PUBLICATION_UNCERTAINTY_DISCLAIMER,
    };
  }

  return {
    title,
    location,
    estimatedDate,
    subject: `Nueva alerta VPO (fecha estimada): ${title}`.slice(0, 140),
    intro:
      'Hemos publicado una <strong>nueva alerta de próximo lanzamiento</strong> en Radar VPO PRO. La fecha es <strong>estimada</strong>: no siempre se publica a los 60 días y a veces no llega a publicarse.',
    ctaLabel: 'Ver próximos lanzamientos',
    pageUrl: alertsUrl,
    sms: buildSmsWithUrl(
      `Radar VPO PRO: nueva alerta en ${location}. Fecha estimada, puede no publicarse.`,
      alertsUrl,
    ),
    disclaimer: PUBLICATION_UNCERTAINTY_DISCLAIMER,
  };
}
