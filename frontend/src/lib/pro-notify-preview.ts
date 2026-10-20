/**
 * Misma plantilla que backend/src/notifications/pro-notify-copy.ts
 * (new_publication). Si cambia el SMS real, hay que actualizar este archivo.
 */
const SMS_MAX_LENGTH = 160;

export function buildSmsWithUrl(body: string, url: string, max = SMS_MAX_LENGTH) {
  const reserved = url.length + 1;
  const budget = Math.max(0, max - reserved);
  const trimmed =
    body.length > budget ? `${body.slice(0, Math.max(0, budget - 3)).trimEnd()}...` : body;
  return `${trimmed} ${url}`.slice(0, max);
}

export function previewPublicationNotify(input: {
  title: string;
  location: string;
  promotionsUrl: string;
}) {
  return {
    sms: buildSmsWithUrl(
      `Radar VPO PRO: nueva promoción publicada en ${input.location}.`,
      input.promotionsUrl,
    ),
    subject: `Nueva promoción VPO publicada: ${input.title}`.slice(0, 140),
    intro:
      'Hay una nueva promoción publicada en Radar VPO. Puedes consultar el documento oficial de la promoción aquí:',
  };
}
