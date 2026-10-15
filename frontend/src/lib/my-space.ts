import type { FavoriteStage } from '@/types';

/** Límite de promociones guardadas en una cuenta gratuita (se aplica en el backend). */
export const FREE_SAVED_PROMOTIONS_LIMIT = 3;

export const CHECKLIST_ITEMS = [
  { id: 'read_bases', label: 'Leer las bases de la promoción' },
  { id: 'check_requirements', label: 'Comprobar que cumplo los requisitos' },
  { id: 'gather_documents', label: 'Reunir la documentación necesaria' },
  { id: 'register_applicant', label: 'Estar inscrito en el registro de solicitantes' },
  { id: 'submit_application', label: 'Presentar mi solicitud' },
  { id: 'keep_receipt', label: 'Guardar el justificante' },
] as const;

export const STAGES: Array<{ value: FavoriteStage; label: string }> = [
  { value: 'interested', label: 'Me interesa' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'applied', label: 'Solicitud presentada' },
  { value: 'discarded', label: 'Descartada' },
];

export function stageLabel(stage: FavoriteStage): string {
  return STAGES.find((item) => item.value === stage)?.label ?? 'Me interesa';
}

export function checklistProgress(done: readonly string[]): {
  done: number;
  total: number;
  percent: number;
} {
  const valid = new Set<string>(CHECKLIST_ITEMS.map((item) => item.id));
  const completed = new Set(done.filter((id) => valid.has(id))).size;
  const total = CHECKLIST_ITEMS.length;
  return { done: completed, total, percent: Math.round((completed / total) * 100) };
}

export function toggleChecklistItem(done: readonly string[], id: string): string[] {
  const next = new Set(done);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return CHECKLIST_ITEMS.map((item) => item.id).filter((itemId) => next.has(itemId));
}

/** Orden de la lista: primero lo que se está trabajando, al final lo descartado. */
const STAGE_ORDER: Record<FavoriteStage, number> = {
  preparing: 0,
  interested: 1,
  applied: 2,
  discarded: 3,
};

export function sortSavedByStage<T extends { stage: FavoriteStage; createdAt: string }>(
  items: readonly T[],
): T[] {
  return [...items].sort(
    (a, b) =>
      STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] ||
      b.createdAt.localeCompare(a.createdAt),
  );
}
