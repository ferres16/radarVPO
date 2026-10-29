import { shortenAlertTitle } from '@/lib/alert-title';
import {
  CATALUNYA_MUNICIPALITIES,
  cleanMunicipalityRaw,
  resolveMunicipalityLabel,
} from '@/lib/municipalities';

const SMALL_WORDS = new Set(['i', 'de', 'del', 'dels', 'la', 'les', 'el', 'els', 'l', 'd', 'en', 'al']);

const REJECTED = /^(catalunya|cataluña|termini|dies|días|anunci|plazo|detalls|procediment|adjudicacio|adjudicación|vigor|venda|venta|lloguer|alquiler|hpo|vpo|slu|sl|sa)$/i;

function stripDiacritics(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalizeKey(value: string) {
  return stripDiacritics(cleanMunicipalityRaw(value))
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function titleCaseMunicipality(value: string): string {
  const cleaned = cleanMunicipalityRaw(value);
  if (!cleaned) return '';
  return cleaned
    .split(/\s+/)
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index > 0 && SMALL_WORDS.has(lower.replace(/'/g, ''))) return lower;
      if (/^d'/i.test(word)) {
        return `d'${word.slice(2, 3).toUpperCase()}${word.slice(3).toLowerCase()}`;
      }
      if (/^l'/i.test(word)) {
        return `l'${word.slice(2, 3).toUpperCase()}${word.slice(3).toLowerCase()}`;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

/**
 * Extrae municipio del título de alerta aunque la BBDD no lo tenga bien guardado.
 * Formato típico: "… promoguts per EMPRESA a MUNICIPI"
 */
export function extractMunicipalityFromAlertTitle(title: string): string | null {
  const text = shortenAlertTitle(title);

  const patterns = [
    /\bpromoguts?\s+per\s+.+\s+a\s+([A-ZÀ-ÜÁÉÍÓÚÑ][A-ZÀ-ÜÁÉÍÓÚÑa-zà-üáéíóúñ'\s-]{1,80})$/i,
    /\bpromovidos?\s+por\s+.+\s+en\s+([A-ZÀ-ÜÁÉÍÓÚÑ][A-ZÀ-ÜÁÉÍÓÚÑa-zà-üáéíóúñ'\s-]{1,80})$/i,
    /\ba\s+([A-ZÀ-ÜÁÉÍÓÚÑ][A-ZÀ-ÜÁÉÍÓÚÑa-zà-üáéíóúñ'\s-]{1,80})$/i,
    /\ben\s+([A-ZÀ-ÜÁÉÍÓÚÑ][A-ZÀ-ÜÁÉÍÓÚÑa-zà-üáéíóúñ'\s-]{1,80})$/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    const raw = match?.[1]?.trim().replace(/[.,;:]+$/, '');
    if (!raw || REJECTED.test(raw)) continue;

    const fromCatalog = resolveMunicipalityLabel(raw);
    if (fromCatalog && !REJECTED.test(fromCatalog)) {
      // resolveMunicipalityLabel puede devolver el raw limpio si no está en catálogo.
      const known = CATALUNYA_MUNICIPALITIES.find(
        (item) => normalizeKey(item.name) === normalizeKey(fromCatalog),
      );
      if (known) return known.name;
    }

    const titled = titleCaseMunicipality(raw);
    if (titled && !REJECTED.test(titled)) return titled;
  }

  return null;
}

/** Etiqueta visible: BBDD canónica, o extracción desde el título. */
export function resolveAlertMunicipality(alert: {
  title: string;
  municipality?: string | null;
  municipalityId?: string | null;
}): string | null {
  const fromFields = resolveMunicipalityLabel(alert.municipality, alert.municipalityId).trim();
  if (fromFields && !REJECTED.test(fromFields)) {
    const known = CATALUNYA_MUNICIPALITIES.find(
      (item) =>
        item.id === alert.municipalityId ||
        normalizeKey(item.name) === normalizeKey(fromFields),
    );
    if (known) return known.name;
    // Si viene en MAYÚSCULAS desde BBDD, normalizar tipografía.
    if (fromFields === fromFields.toUpperCase()) {
      return titleCaseMunicipality(fromFields);
    }
    return fromFields;
  }
  return extractMunicipalityFromAlertTitle(alert.title);
}
