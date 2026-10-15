/**
 * Pasos de preparación que cada persona marca por su cuenta en "Mi espacio".
 * Es una guía de autoorganización: Radar VPO no revisa ni tramita la solicitud.
 */
export const FAVORITE_CHECKLIST_IDS = [
  'read_bases',
  'check_requirements',
  'gather_documents',
  'register_applicant',
  'submit_application',
  'keep_receipt',
] as const;

export type FavoriteChecklistId = (typeof FAVORITE_CHECKLIST_IDS)[number];

export function normalizeChecklist(ids: readonly string[]): string[] {
  const allowed = new Set<string>(FAVORITE_CHECKLIST_IDS);
  return FAVORITE_CHECKLIST_IDS.filter((id) => ids.includes(id) && allowed.has(id));
}
