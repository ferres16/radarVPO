import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function cleanValue(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s{2,}/g, ' ').trim();
  return cleaned.length > 0 ? cleaned : null;
}

function isWeakLocation(value: string | null): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  if (normalized.length < 4) return true;
  return /^(sol|n\/d|nd|catalunya|cataluna)$/.test(normalized);
}

function extractHomesCount(text: string) {
  const match = text.match(/(\d{1,4})\s+(habitatges|viviendas|vivendes|vivienda)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function extractAddress(text: string) {
  const match = text.match(/(carrer|calle|avinguda|avenida|av\.|c\.)\s+[^,\n]+(?:,\s*\d+)?/i);
  return match?.[0]?.trim() ?? null;
}

function extractPromoter(text: string) {
  const match = text.match(
    /promoguts?\s+per\s+(.+?)(?=\s+al\s+municipi\b|\s+a\s+[A-ZÀ-Ú]|\.|,|\n|$)/i,
  );
  if (!match?.[1]) return null;

  return match[1]
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractMunicipality(text: string) {
  const patterns = [
    /al\s+municipi\s+d(?:e|')\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
    /al\s+municipio\s+de\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
    /situats?\s+(?:al|a\s+l['’])\s+municipi\s+d(?:e|')\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
    /\ba\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})(?:[\.,\n]|$)/i,
    /\bde\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match?.[1]) {
      continue;
    }

    const value = match[1]
      .replace(/\s+en\s+el\s+termini[\s\S]*$/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    if (
      !value ||
      /^(sol)$/i.test(value) ||
      /habitatges|hpo|venda|alquiler|termini|dies|detalls|procediment/i.test(
        value,
      )
    ) {
      continue;
    }

    return value;
  }

  return null;
}

function extractLine(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (!match?.[0]) return null;
  return cleanValue(match[0]);
}

type HousingRow = {
  label: string;
  homes: number;
};

function parseHousingRows(
  units: Record<string, unknown>,
  textPool: string,
): HousingRow[] {
  const fromAi = units.home_mix;
  if (Array.isArray(fromAi)) {
    const rows = fromAi
      .map((item) => {
        const row = asRecord(item);
        const label = asString(row.label) || asString(row.type) || asString(row.room_type);
        const homes = asNumber(row.homes) ?? asNumber(row.count) ?? asNumber(row.units);
        if (!label || homes === null) {
          return null;
        }
        return { label, homes };
      })
      .filter((item): item is HousingRow => item !== null);

    if (rows.length > 0) {
      return rows;
    }
  }

  const regex = /(\d{1,3})\s+(?:habitatges?|viviendas?)\s*(?:de|d')?\s*([^\n,.;]{0,70})/gi;
  const rows: HousingRow[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(textPool)) !== null) {
    const homes = Number(match[1]);
    if (!Number.isNaN(homes)) {
      rows.push({
        label: cleanValue(match[2]) || 'Tipologia general',
        homes,
      });
    }
  }

  const tableLikeRegex = /(\d{1,3})\s+(?:habitatges?|viviendas?)\b/gi;
  if (rows.length === 0) {
    let m: RegExpExecArray | null;
    while ((m = tableLikeRegex.exec(textPool)) !== null) {
      const homes = Number(m[1]);
      if (!Number.isNaN(homes)) {
        rows.push({ label: 'Tipologia general', homes });
      }
    }
  }

  const deduped = new Map<string, HousingRow>();
  for (const row of rows) {
    const key = `${row.label.toLowerCase()}|${row.homes}`;
    if (!deduped.has(key)) {
      deduped.set(key, row);
    }
  }

  return [...deduped.values()];
}

function firstPdfUrl(docs: Array<{ fileType: string; documentUrl: string }>) {
  const found = docs.find((doc) => /pdf/i.test(doc.fileType));
  return found?.documentUrl || null;
}

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promotion = await api.getPromotionById(id).catch(() => null);

  if (!promotion) {
    return notFound();
  }

  const latestAnalysis = promotion.aiAnalysis[0]?.resultJson || {};
  const promotionData = asRecord(asRecord(latestAnalysis).promotion);
  const requirements = asRecord(asRecord(latestAnalysis).requirements);
  const units = asRecord(asRecord(latestAnalysis).units);
  const importantDates = asRecord(asRecord(latestAnalysis).important_dates);
  const pdfUrl = firstPdfUrl(promotion.documents) || promotion.sourceUrl;
  const documentsText = promotion.documents
    .map((doc) => doc.extractedText || '')
    .filter((value) => value.trim().length > 0)
    .join('\n\n');

  const textPool = `${promotion.title}\n${promotion.rawText || ''}\n${documentsText}`;
  let housingRows = parseHousingRows(units, textPool);

  const unitsTotal =
    asNumber(units.total_homes) ??
    asNumber(units.total_units) ??
    asNumber(units.hpo_homes) ??
    extractHomesCount(textPool);

  if (housingRows.length === 0 && unitsTotal !== null) {
    housingRows = [{ label: 'Total viviendas', homes: unitsTotal }];
  }

  const promoter =
    asString(promotionData.promoter)?.replace(/\s+al\s+municipi[\s\S]*$/i, '').trim() ||
    extractPromoter(textPool);

  const fallbackMunicipality =
    promotion.municipality || extractMunicipality(textPool) || 'Catalunya';

  const address = asString(promotionData.address) || extractAddress(textPool);

  const aiLocation = cleanValue(asString(promotionData.full_location));
  const aiAddress = cleanValue(asString(promotionData.address));
  const specificLocation = !isWeakLocation(aiLocation)
    ? aiLocation
    : !isWeakLocation(aiAddress)
      ? aiAddress
      : [address, fallbackMunicipality].filter(Boolean).join(', ') ||
        `${fallbackMunicipality}${
          promotion.province ? `, ${promotion.province}` : ''
        }`;

  const incomeRequirement =
    asString(requirements.income_limits) ||
    extractLine(textPool, /(ingres[oa]s?|renda)[^\n]{0,140}/i) ||
    'n/d';

  const residencyRequirement =
    asString(requirements.residency_requirement) ||
    extractLine(textPool, /(empadronament|empadronamiento)[^\n]{0,140}/i) ||
    'n/d';

  const otherRequirement =
    asString(requirements.other_conditions) ||
    extractLine(textPool, /(requisits?|requisitos|condicions?|condiciones)[^\n]{0,180}/i) ||
    'n/d';

  const isUpcoming = promotion.futureLaunch || promotion.status === 'upcoming';

  return (
    <main className="shell">
      <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">{promotion.title}</h1>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Ubicacion</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">{specificLocation}</p>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Resumen</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">Tipo: {promotion.promotionType}</p>
            <p className="text-sm text-[var(--ink)]">Estado: {promotion.status}</p>
            <p className="text-sm text-[var(--ink)]">Total viviendas: {unitsTotal ?? 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Promotor: {promoter || 'n/d'}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Fechas importantes</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">{isUpcoming ? 'Publicacion alerta' : 'Publicacion anuncio'}: {promotion.publishedAt ? promotion.publishedAt.slice(0, 10) : 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">{isUpcoming ? 'Salida estimada' : 'Fecha de lanzamiento'}: {isUpcoming ? (promotion.estimatedPublicationDate ? promotion.estimatedPublicationDate.slice(0, 10) : asString(importantDates.estimated_publication_date) || 'n/d') : (promotion.publishedAt ? promotion.publishedAt.slice(0, 10) : 'n/d')}</p>
            <p className="text-sm text-[var(--ink)]">Fin solicitud: {promotion.deadlineDate ? promotion.deadlineDate.slice(0, 10) : asString(importantDates.application_deadline) || 'n/d'}</p>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Requisitos principales</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">Ingresos: {incomeRequirement}</p>
            <p className="text-sm text-[var(--ink)]">Empadronamiento: {residencyRequirement}</p>
            <p className="text-sm text-[var(--ink)]">Otros: {otherRequirement}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Tabla de viviendas disponibles</h2>
          {housingRows.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink)]">No se han podido extraer filas de viviendas del PDF.</p>
          ) : (
            <table className="mt-3 w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--stroke)] px-2 py-2 text-left text-[var(--ink-soft)]">Tipologia</th>
                  <th className="border-b border-[var(--stroke)] px-2 py-2 text-left text-[var(--ink-soft)]">Viviendas</th>
                </tr>
              </thead>
              <tbody>
                {housingRows.map((row, index) => (
                  <tr key={`${row.label}-${index}`}>
                    <td className="border-b border-[var(--stroke)] px-2 py-2 text-[var(--ink)]">{row.label}</td>
                    <td className="border-b border-[var(--stroke)] px-2 py-2 text-[var(--ink)]">{row.homes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="chip">{promotion.promotionType}</span>
          <span className="chip">Estado: {promotion.status}</span>
          {promotion.futureLaunch ? <span className="chip">Alerta 60 dias</span> : null}
        </div>

        <details className="mt-5 rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--ink)]">Ver texto original analizado</summary>
          <p className="mt-3 whitespace-pre-wrap text-sm text-[var(--ink)]">{promotion.rawText || 'Sin texto original.'}</p>
        </details>

        <a href={pdfUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
          Ver PDF
        </a>
      </article>
    </main>
  );
}
