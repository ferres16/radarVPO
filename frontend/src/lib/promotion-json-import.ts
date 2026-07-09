export type PromotionSectionKey =
  | 'importantDates'
  | 'requirements'
  | 'economicInfo'
  | 'feesAndReservations'
  | 'contactInfo';

export type PromotionSectionRecords = Record<
  PromotionSectionKey,
  Array<{ key: string; value: string }>
>;

export type PromotionFormPatch = {
  title?: string;
  location?: string;
  municipality?: string;
  province?: string;
  promotionType?: string;
  promoter?: string;
  totalHomes?: string;
  publicDescription?: string;
};

export type PromotionJsonImportResult = {
  sections: Partial<PromotionSectionRecords>;
  formPatch: PromotionFormPatch;
  summary: string[];
  errors: string[];
};

const BLOCK_ALIASES: Record<string, PromotionSectionKey> = {
  fechas: 'importantDates',
  importantDates: 'importantDates',
  important_dates: 'importantDates',
  requisitos: 'requirements',
  requirements: 'requirements',
  economia: 'economicInfo',
  economicInfo: 'economicInfo',
  economic_info: 'economicInfo',
  cuotas_reservas: 'feesAndReservations',
  feesAndReservations: 'feesAndReservations',
  fees_and_reservations: 'feesAndReservations',
  contacto: 'contactInfo',
  contactInfo: 'contactInfo',
  contact_info: 'contactInfo',
};

const SECTION_LABELS: Record<PromotionSectionKey, string> = {
  importantDates: 'Fechas',
  requirements: 'Requisitos',
  economicInfo: 'Economía',
  feesAndReservations: 'Cuotas y reservas',
  contactInfo: 'Contacto',
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function valueToString(raw: unknown) {
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'number' || typeof raw === 'boolean') return String(raw);
  return JSON.stringify(raw);
}

export function objectToPromotionRecords(value: Record<string, unknown>) {
  return Object.entries(value)
    .map(([key, raw]) => ({
      key: key.trim(),
      value: valueToString(raw),
    }))
    .filter((row) => row.key && row.value);
}

function extractTotalHomes(value: Record<string, unknown>) {
  const raw = value.total_viviendas ?? value.totalHomes ?? value.total;
  if (typeof raw === 'number') return String(raw);
  if (typeof raw === 'string') {
    const match = raw.match(/\d+/);
    return match?.[0] || '';
  }
  return '';
}

function inferPromotionType(value: Record<string, unknown>) {
  const tipo = valueToString(value.tipo).toLowerCase();
  if (tipo.includes('alquiler')) return 'alquiler';
  if (tipo.includes('venta')) return 'venta';
  if (tipo.includes('mixto')) return 'mixto';
  return undefined;
}

function inferLocationFields(ubicacion: string) {
  const parts = ubicacion
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { location: ubicacion.trim() };
  }

  const municipality = parts[parts.length - 1];
  const province = parts.length > 1 ? parts[parts.length - 2] : undefined;

  return {
    location: ubicacion.trim(),
    municipality,
    province,
  };
}

export function parsePromotionStructuredJson(input: string): PromotionJsonImportResult {
  const errors: string[] = [];
  const summary: string[] = [];
  const sections: Partial<PromotionSectionRecords> = {};
  const formPatch: PromotionFormPatch = {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return {
      sections: {},
      formPatch: {},
      summary: [],
      errors: ['JSON inválido. Revisa comas, comillas y llaves.'],
    };
  }

  const root = asRecord(parsed);
  if (!root) {
    return {
      sections: {},
      formPatch: {},
      summary: [],
      errors: ['El JSON debe ser un objeto con bloques como fechas, requisitos, economia, cuotas_reservas y contacto.'],
    };
  }

  for (const [rawKey, rawValue] of Object.entries(root)) {
    const sectionKey = BLOCK_ALIASES[rawKey];
    const block = asRecord(rawValue);
    if (!sectionKey || !block) continue;

    const records = objectToPromotionRecords(block);
    if (records.length === 0) continue;

    sections[sectionKey] = records;
    summary.push(`${SECTION_LABELS[sectionKey]}: ${records.length} campos`);
  }

  const contacto = asRecord(root.contacto) || asRecord(root.contactInfo) || asRecord(root.contact_info);
  if (contacto) {
    if (contacto.promotor) formPatch.promoter = valueToString(contacto.promotor);
    if (contacto.ubicacion) {
      Object.assign(formPatch, inferLocationFields(valueToString(contacto.ubicacion)));
    }
  }

  const cuotas = asRecord(root.cuotas_reservas) || asRecord(root.feesAndReservations) || asRecord(root.fees_and_reservations);
  if (cuotas) {
    const totalHomes = extractTotalHomes(cuotas);
    if (totalHomes) formPatch.totalHomes = totalHomes;
  }

  const economia = asRecord(root.economia) || asRecord(root.economicInfo) || asRecord(root.economic_info);
  if (economia) {
    const promotionType = inferPromotionType(economia);
    if (promotionType) formPatch.promotionType = promotionType;
  }

  if (Object.keys(sections).length === 0) {
    errors.push(
      'No se encontraron bloques reconocidos. Usa fechas, requisitos, economia, cuotas_reservas y/o contacto.',
    );
  }

  return { sections, formPatch, summary, errors };
}

export function mergePromotionSections(
  current: PromotionSectionRecords,
  imported: Partial<PromotionSectionRecords>,
  mode: 'merge' | 'replace',
): PromotionSectionRecords {
  const next: PromotionSectionRecords = { ...current };

  (Object.keys(imported) as PromotionSectionKey[]).forEach((sectionKey) => {
    const incoming = imported[sectionKey];
    if (!incoming?.length) return;

    if (mode === 'replace') {
      next[sectionKey] = incoming;
      return;
    }

    const merged = new Map(current[sectionKey].map((row) => [row.key, row.value]));
    incoming.forEach((row) => merged.set(row.key, row.value));
    next[sectionKey] = Array.from(merged.entries()).map(([key, value]) => ({ key, value }));
  });

  return next;
}
