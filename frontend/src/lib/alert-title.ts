/**
 * Shorten scraped alert titles for display.
 * Official alerts append a long fixed sentence about the 60-day announcement window.
 */

const ALERT_BOILERPLATE =
  /\s*En el termini de\s+\d+\s*dies\s+es\s+publicar[àa]\s+l['’]anunci\s+amb\s+els\s+detalls\s+i\s+on\s+es\s+recollir[àa]\s+el\s+procediment\s+d['’]adjudicaci[oó]\.?/gi;

const ALERT_BOILERPLATE_ES =
  /\s*En el plazo de\s+\d+\s*d[ií]as\s+se\s+publicar[áa]\s+el\s+anuncio\s+con\s+los\s+detalles\s+y\s+donde\s+se\s+recoger[áa]\s+el\s+procedimiento\s+de\s+adjudicaci[oó]n\.?/gi;

export function shortenAlertTitle(title: string): string {
  return title
    .replace(ALERT_BOILERPLATE, '')
    .replace(ALERT_BOILERPLATE_ES, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\s*$/, '.')
    .trim();
}
