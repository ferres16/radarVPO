import { normalizeMunicipality } from './municipalities/catalunya-municipalities';

export type ProAlertPreferenceUser = {
  alertMunicipalityIds?: unknown;
  alertPromotionTypes?: unknown;
};

export type ProAlertPromotionMatch = {
  municipality?: string | null;
  municipalityId?: string | null;
  promotionType?: string | null;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Si el usuario no ha configurado filtro, recibe todos los avisos (compatibilidad).
 * Si configura municipios o regímenes, excluye lo que no encaja.
 */
export function userMatchesProAlertPreferences(
  user: ProAlertPreferenceUser,
  promotion: ProAlertPromotionMatch,
): boolean {
  const municipalityIds = asStringArray(user.alertMunicipalityIds);
  const promotionTypes = asStringArray(user.alertPromotionTypes);

  if (municipalityIds.length > 0) {
    const promotionMunicipalityId =
      promotion.municipalityId ||
      normalizeMunicipality(promotion.municipality).canonicalId;
    if (
      !promotionMunicipalityId ||
      !municipalityIds.includes(promotionMunicipalityId)
    ) {
      return false;
    }
  }

  if (promotionTypes.length > 0) {
    const type = (promotion.promotionType || '').trim();
    if (!type || type === 'desconocido' || !promotionTypes.includes(type)) {
      return false;
    }
  }

  return true;
}
