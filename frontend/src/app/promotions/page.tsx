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

  const fromMunicipi = pool.match(
    /al\s+municipi\s+d(?:e|')\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})/i,
  );
  if (fromMunicipi?.[1]) {
    return fromMunicipi[1].trim();
  }

  const fromA = pool.match(/\ba\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,60})(?:[\.,\n]|$)/i);
  if (fromA?.[1]) {
    const candidate = fromA[1].trim();
    if (!/termini|dies|detalls|procediment|adjudicaci[oó]n?/i.test(candidate)) {
      return candidate;
    }
  }

  const fromAddress = pool.match(/(carrer|calle|avinguda|avenida)\s+[^,\n]+,?\s*\d*\s+de\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/i);
  if (fromAddress?.[2]) {
    return fromAddress[2].trim();
  }

  const fromDe = pool.match(/\bde\s+([A-ZÀ-Ú][A-Za-zÀ-ú'\-\s]{2,40})/);
  if (fromDe?.[1]) {
    const candidate = fromDe[1].trim();
    if (!/^(sol)$/i.test(candidate) && !/catalunya|habitatges|hpo|venda|alquiler|promoguts/i.test(candidate)) {
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

function getAlertReleaseDate(promotion: Promotion) {
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

function getAnnouncementLaunchDate(promotion: Promotion) {
  if (promotion.publishedAt) {
    return promotion.publishedAt.slice(0, 10);
  }

  return 'n/d';
}

function sortByLatest(promotions: Promotion[], dateResolver: (promotion: Promotion) => string) {
  return [...promotions].sort((a, b) => {
    const aDate = dateResolver(a);
    const bDate = dateResolver(b);
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

  const baseQuery = new URLSearchParams();
  if (municipality) baseQuery.set('municipality', municipality);
  if (province) baseQuery.set('province', province);
  if (promotionType) baseQuery.set('promotionType', promotionType);

  const alertsQuery = new URLSearchParams(baseQuery);
  alertsQuery.set('status', 'upcoming');

  const publishedQuery = new URLSearchParams(baseQuery);
  publishedQuery.set('publishedOnly', 'true');

  const [alertsRaw, announcementsRaw] = await Promise.all([
    api.getPromotions(`?${alertsQuery.toString()}`),
    api.getPromotions(`?${publishedQuery.toString()}`),
  ]);

  const alerts = sortByLatest(
    dedupePromotions(alertsRaw),
    (promotion) => getAlertReleaseDate(promotion),
  );

  const announcements = sortByLatest(
    dedupePromotions(announcementsRaw),
    (promotion) => getAnnouncementLaunchDate(promotion),
  );

  return (
    <main className="shell">
      <header className="mb-5 rounded-2xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Alertas y promociones publicadas</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">Vista separada entre alertas de proximas promociones y anuncios ya publicados con PDF.</p>
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
          <button className="rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)]">
            Filtrar
          </button>
        </form>
      </header>

      <section className="mb-6">
        <h2 className="mb-2 text-xl font-bold text-[var(--ink)]">Alertas de proximas promociones</h2>
        <p className="mb-4 text-sm text-[var(--ink-soft)]">Incluye publicaciones de tipo alerta (60 dias) con fecha estimada de salida.</p>
        {alerts.length === 0 ? (
          <EmptyState title="Sin alertas" description="No hay alertas de proximas promociones para los filtros actuales." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {alerts.map((promotion) => (
              <div key={promotion.id} className="space-y-2">
                <PromotionCard
                  promotion={promotion}
                  hideDetail
                  hideStatus
                  titleOverride={buildCardTitle(promotion)}
                />
                <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-card">
                  Fecha de salida estimada: {getAlertReleaseDate(promotion)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xl font-bold text-[var(--ink)]">Promociones ya publicadas (anuncios con PDF)</h2>
        <p className="mb-4 text-sm text-[var(--ink-soft)]">Solo anuncios publicados que tienen PDF para analisis. Aqui no se calcula fecha: se usa la fecha real de publicacion del anuncio.</p>
        {announcements.length === 0 ? (
          <EmptyState title="Sin promociones publicadas" description="No hay anuncios publicados con PDF para los filtros actuales." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {announcements.map((promotion) => (
              <div key={promotion.id} className="space-y-2">
                <PromotionCard
                  promotion={promotion}
                  hideStatus
                  titleOverride={buildCardTitle(promotion)}
                />
                <div className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm font-semibold text-[var(--ink)] shadow-card">
                  Fecha de lanzamiento: {getAnnouncementLaunchDate(promotion)}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
