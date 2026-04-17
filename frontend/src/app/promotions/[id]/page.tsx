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

  const unitsTotal =
    asNumber(units.total_homes) ??
    asNumber(units.total_units) ??
    asNumber(units.hpo_homes);

  const specificLocation =
    asString(promotionData.full_location) ||
    asString(promotionData.address) ||
    `${promotion.municipality || 'Catalunya'}${
      promotion.province ? `, ${promotion.province}` : ''
    }`;

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
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Fechas importantes</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">Publicacion alerta: {promotion.publishedAt ? promotion.publishedAt.slice(0, 10) : 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Salida estimada: {promotion.estimatedPublicationDate ? promotion.estimatedPublicationDate.slice(0, 10) : asString(importantDates.estimated_publication_date) || 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Fin solicitud: {promotion.deadlineDate ? promotion.deadlineDate.slice(0, 10) : asString(importantDates.application_deadline) || 'n/d'}</p>
          </div>
          <div className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Requisitos principales</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">Ingresos: {asString(requirements.income_limits) || 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Empadronamiento: {asString(requirements.residency_requirement) || 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Otros: {asString(requirements.other_conditions) || 'n/d'}</p>
          </div>
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
