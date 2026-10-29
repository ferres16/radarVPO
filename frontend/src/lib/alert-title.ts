/**
 * Shorten scraped alert titles for display.
 * Official alerts append a long fixed sentence about the announcement window;
 * titles are often truncated mid-sentence in storage, so we cut from the boilerplate start.
 */

export function shortenAlertTitle(title: string): string {
  return title
    .replace(/\s*En el termini de\s+\d+\s*dies\s+es\s+publicar[\s\S]*$/i, '')
    .replace(/\s*En el plazo de\s+\d+\s*d[ií]as\s+se\s+publicar[\s\S]*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/^[-:;,.\s]+/, '')
    .replace(/\s*[.]*\s*$/, '')
    .trim();
}
