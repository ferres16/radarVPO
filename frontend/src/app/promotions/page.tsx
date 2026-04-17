import { api } from '@/lib/api';
import { EmptyState } from '@/components/empty-state';
import { PromotionCard } from '@/components/promotion-card';
import { Promotion } from '@/types';

function extractHomesCount(text?: string | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d{1,4})\s+(habitatges|viviendas|vivendes)/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? null : parsed;
}

function formatTypeLabel(type: string) {
  if (type === 'venta') return 'venta';
  if (type === 'alquiler') return 'alquiler';
  if (type === 'mixto') return 'mixto';
  return 'tipo desconocido';
}

function canonicalSourceUrl(url: string) {
  try {
    const parsed = new URL(url);
    const idNoticia = parsed.searchParams.get('idNoticia');
    if (/03_noticias_detalle\.jsp/i.test(parsed.pathname) && idNoticia) {
      parsed.search = `?idNoticia=${idNoticia}`;
      parsed.hash = '';
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function inferLocation(promotion: Promotion & { rawText?: string | null }) {
  const direct = (promotion.municipality || '').trim();
  if (direct && !/^catalunya$/i.test(direct)) {
    return direct;
  }

  const pool = `${promotion.title}\n${promotion.rawText || ''}`;

  const fromAddress = pool.match(/(carrer|calle|avinguda|avenida)\s+[^,\n]+,?\s*\d*\s+de\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/i);
  if (fromAddress?.[2]) {
    return fromAddress[2].trim();
  }

  const fromDe = pool.match(/\bde\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/);
  if (fromDe?.[1]) {
    const candidate = fromDe[1].trim();
    if (!/catalunya|habitatges|hpo|venda|alquiler|promoguts/i.test(candidate)) {
      return candidate;
    }
  }

  return 'Ubicacion no especificada';
}

function dedupePromotions(promotions: Promotion[]) {
  const unique = new Map<string, Promotion>();

  for (const promotion of promotions) {
    const key = `${canonicalSourceUrl(promotion.sourceUrl)}|${promotion.title
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()}`;

    if (!unique.has(key)) {
      unique.set(key, promotion);
    }
  }

  return [...unique.values()];
}

function getReleaseDate(promotion: Promotion) {
  if (promotion.estimatedPublicationDate) {
    return promotion.estimatedPublicationDate.slice(0, 10);
  }

  if (promotion.publishedAt && promotion.futureLaunch) {
    const base = new Date(promotion.publishedAt);
    if (!Number.isNaN(base.getTime())) {
      const estimated = new Date(base.getTime() + 60 * 24 * 60 * 60 * 1000);
      return estimated.toISOString().slice(0, 10);
    }
  }

  if (promotion.publishedAt) {
    return promotion.publishedAt.slice(0, 10);
  }

  return 'n/d';
}

function sortByLatest(promotions: Promotion[]) {
  return [...promotions].sort((a, b) => {
    const aDate = a.estimatedPublicationDate || a.publishedAt || '';
    const bDate = b.estimatedPublicationDate || b.publishedAt || '';
    return bDate.localeCompare(aDate);
  });
}

function buildCardTitle(promotion: {
  municipality?: string | null;
  promotionType: string;
  rawText?: string | null;
  title: string;
  sourceUrl: string;
}) {
  const municipality = inferLocation(promotion as Promotion & { rawText?: string | null });
  const homes = extractHomesCount(promotion.rawText || promotion.title);
  const homesText = homes === null ? 'n/d' : String(homes);

  return `Promocion en ${municipality} de tipo ${formatTypeLabel(
    promotion.promotionType,
  )} con un total de ${homesText} viviendas`;
}

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const municipality = typeof sp.municipality === 'string' ? sp.municipality : '';
  const province = typeof sp.province === 'string' ? sp.province : '';
  const promotionType =
    typeof sp.promotionType === 'string' ? sp.promotionType : '';
  const status = typeof sp.status === 'string' ? sp.status : '';

  const query = new URLSearchParams();
  if (municipality) query.set('municipality', municipality);
  if (province) query.set('province', province);
  if (promotionType) query.set('promotionType', promotionType);
  if (status) query.set('status', status);

  const promotions = await api.getPromotions(
    query.size ? `?${query.toString()}` : '',
  );

  const filteredPromotions = sortByLatest(dedupePromotions(promotions)).slice(0, 10);

  return (
    <main className="shell">
      <header className="mb-5 rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Todas las promociones</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Mostrando automaticamente las 10 ultimas promociones unicas.</p>
        <form className="mt-4 flex flex-wrap gap-2" action="/promotions" method="get">
          <input
            name="municipality"
            defaultValue={municipality}
            placeholder="Municipio"
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          />
          <input
            name="province"
            defaultValue={province}
            placeholder="Provincia"
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          />
          <select
            name="promotionType"
            defaultValue={promotionType}
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          >
            <option value="">Tipo</option>
            <option value="venta">Venta</option>
            <option value="alquiler">Alquiler</option>
            <option value="mixto">Mixto</option>
          </select>
          <select
            name="status"
            defaultValue={status}
            className="rounded-full border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-700)]"
          >
            <option value="">Estado</option>
            <option value="open">Open</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
          </select>
          <button className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Filtrar
          </button>
        </form>
      </header>

      {filteredPromotions.length === 0 ? (
        <EmptyState title="Sin promociones" description="Todavia no hay promociones disponibles." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPromotions.map((promotion) => (
            <div key={promotion.id} className="space-y-2">
              <PromotionCard
                promotion={promotion}
                hideStatus
                titleOverride={buildCardTitle(promotion)}
              />
              <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-card">
                Fecha de salida: {getReleaseDate(promotion)}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
