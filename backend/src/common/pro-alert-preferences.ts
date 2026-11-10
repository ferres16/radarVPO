/**
 * Preferencias territoriales de avisos PRO: desactivadas.
 * Todos los usuarios PRO verificados reciben todos los avisos (email/SMS según canal).
 * Se conserva la firma por compatibilidad con llamadas existentes.
 */

export type ProAlertPreferenceUser = {
  alertMunicipalityIds?: unknown;
  alertPromotionTypes?: unknown;
};

export type ProAlertPromotionMatch = {
  municipality?: string | null;
  municipalityId?: string | null;
  promotionType?: string | null;
};

/** Siempre true: no se filtra por municipio ni régimen. */
export function userMatchesProAlertPreferences(
  user: ProAlertPreferenceUser,
  promotion: ProAlertPromotionMatch,
): boolean {
  void user;
  void promotion;
  return true;
}
