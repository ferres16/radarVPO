import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { hasPublicFicha, isAlertPromotion } from '@/lib/promotion-access';
import { proHref, proPlan } from '@/lib/pro';
import { InlineAdCard } from '@/components/ads';
import { ButtonLink, SectionHeader, SurfaceCard } from '@/components/design-system';
import { ProComparison } from '@/components/pro-comparison';
import { StructuredData } from '@/components/structured-data';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

type JsonMap = Record<string, unknown>;

function isJsonMap(value: unknown): value is JsonMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringifyValue(value: unknown) {
  if (value === null || value === undefined || value === '') return 'n/d';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return 'n/d';
    const allPrimitive = value.every(
      (item) => item === null || ['string', 'number', 'boolean'].includes(typeof item),
    );

    if (allPrimitive) {
      return value.map((item) => (item === null ? 'n/d' : String(item))).join(' · ');
    }
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'n/d';
  }
}

function renderStructuredValue(value: unknown, depth = 0): ReactNode {
  if (value === null || value === undefined || value === '') {
    return <span className="text-sm text-[var(--ink-soft)]">n/d</span>;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return (
      <span className="block break-words text-[0.9375rem] leading-relaxed text-[var(--ink)]">
        {String(value)}
      </span>
    );
  }

  if (Array.isArray(value)) {
    const allPrimitive = value.every(
      (item) => item === null || ['string', 'number', 'boolean'].includes(typeof item),
    );

    if (allPrimitive) {
      return (
        <ul className="space-y-1.5 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
          {value.map((item, index) => (
            <li key={index} className="flex gap-2 break-words">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-700)]" aria-hidden="true" />
              <span>{item === null ? 'n/d' : String(item)}</span>
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="rounded-xl bg-white/70 px-3 py-2.5">
            {renderStructuredValue(item, depth + 1)}
          </div>
        ))}
      </div>
    );
  }

  if (isJsonMap(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return <span className="text-sm text-[var(--ink-soft)]">n/d</span>;
    }

    return (
      <dl className={depth > 0 ? 'space-y-2.5 border-l-2 border-[var(--stroke)] pl-3' : 'space-y-2.5'}>
        {entries.map(([key, nestedValue]) => (
          <div key={key} className="min-w-0">
            <dt className="text-xs font-semibold text-[var(--green-700)]">{prettyLabel(key)}</dt>
            <dd className="mt-1 min-w-0">{renderStructuredValue(nestedValue, depth + 1)}</dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-white/70 p-3 font-mono text-xs leading-relaxed text-[var(--ink)]">
      {stringifyValue(value)}
    </pre>
  );
}

function prettyLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

function statusLabel(status: string) {
  if (status === 'published_reviewed') return 'Publicada y revisada';
  if (status === 'published_unreviewed') return 'Publicada · en actualización';
  if (status === 'pending_review') return 'Próximo lanzamiento';
  return 'Archivada';
}

type PromotionDetailParams = {
  params: Promise<{ id: string }>;
};

async function getPromotion(id: string) {
  return api.getPromotionById(id).catch(() => null);
}

export async function generateMetadata({ params }: PromotionDetailParams): Promise<Metadata> {
  const { id } = await params;
  const promotion = await getPromotion(id);

  if (!promotion) {
    return createMetadata({
      title: 'Promoción no disponible',
      description: 'Promoción de vivienda protegida no disponible.',
      path: `/promotions/${id}`,
    });
  }

  const location = promotion.municipality || promotion.province || 'Cataluña';
  return createMetadata({
    title: `${promotion.title} - Vivienda protegida en ${location}`,
    description:
      promotion.publicDescription ||
      `Ficha de promoción de vivienda protegida en ${location}: requisitos, fechas, documentos y fuente oficial.`,
    path: `/promotions/${promotion.id}`,
    keywords: ['promociones VPO', location, promotion.promotionType, 'vivienda protegida'],
  });
}

function DataBlock({
  title,
  payload,
  wide,
}: {
  title: string;
  payload: unknown;
  wide?: boolean;
}) {
  const isMap = isJsonMap(payload);
  const entries = isMap ? Object.entries(payload) : [];

  return (
    <section
      className={`promo-data-block rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 md:p-5 ${wide ? 'md:col-span-2' : ''}`}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">{title}</h2>

      {!isMap || entries.length === 0 ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">Sin datos disponibles.</p>
      ) : (
        <dl className="mt-3 divide-y divide-[var(--stroke)]">
          {entries.map(([key, value]) => (
            <div key={key} className="min-w-0 py-3 first:pt-0 last:pb-0">
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--green-700)]">
                {prettyLabel(key)}
              </dt>
              <dd className="mt-2 min-w-0">{renderStructuredValue(value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export default async function PromotionDetailPage({
  params,
}: PromotionDetailParams) {
  const { id } = await params;
  const promotion = await getPromotion(id);

  if (!promotion) {
    return notFound();
  }

  const documentsByType = {
    images: promotion.documents.filter((doc) => doc.fileType?.startsWith('image/')),
    videos: promotion.documents.filter((doc) => doc.fileType?.startsWith('video/')),
    pdfs: promotion.documents.filter((doc) => doc.fileType?.includes('pdf') || doc.documentKind === 'pdf_original'),
    plans: promotion.documents.filter((doc) => /plano|plan/i.test(doc.originalName || doc.documentKind)),
  };
  const downloadableDocuments = promotion.documents.filter(
    (doc) => !doc.fileType?.startsWith('image/') && !doc.fileType?.startsWith('video/'),
  );
  const heroImage = documentsByType.images[0]?.publicUrl;
  const isAlert = isAlertPromotion(promotion);
  const showFicha = hasPublicFicha(promotion);
  const keyFacts = [
    { label: 'Municipio', value: promotion.municipality || 'Catalunya' },
    { label: 'Régimen', value: promotion.promotionType },
    { label: 'Viviendas', value: promotion.totalHomes ?? 'n/d' },
    { label: 'Promotor', value: promotion.promoter || 'n/d' },
  ];

  return (
    <main className="shell space-y-4 pb-6 md:space-y-6 md:pb-8">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: isAlert ? copy.upcomingLaunches : copy.publishedPromotions, path: isAlert ? '/alerts' : '/promotions' },
          { name: promotion.title, path: `/promotions/${promotion.id}` },
        ])}
      />
      <section className="premium-card promo-detail-hero overflow-hidden">
        <div className="promo-detail-hero__banner relative">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          ) : null}
          <div className="promo-detail-hero__banner-overlay" aria-hidden="true" />
          <div className="relative p-4 md:p-5">
            <span className="w-fit rounded-full border border-white/45 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--green-700)] shadow-sm backdrop-blur">
              {statusLabel(promotion.status)}
            </span>
            <h1 className="display-type mt-3 text-xl font-black leading-snug text-white sm:text-2xl md:text-[1.75rem]">
              {promotion.title}
            </h1>
            <p className="mt-2 text-sm font-medium text-white/88">
              {promotion.municipality || 'Catalunya'}{promotion.province ? `, ${promotion.province}` : ''}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--green-700)]">Resumen rápido</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {keyFacts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{fact.label}</p>
                <p className="mt-1 text-sm font-bold leading-snug text-[var(--ink)]">{fact.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3.5">
            <p className="text-sm font-semibold text-[var(--ink)]">Estado: {statusLabel(promotion.status)}</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              {promotion.statusMessage ||
                (isAlert
                  ? 'Aviso detectado. Aún no hay ficha completa; te avisamos cuando haya más información.'
                  : 'Estamos analizando esta promoción y actualizando la información.')}
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <ButtonLink href={promotion.sourceUrl} variant="primary" block className="sm:!inline-flex sm:w-auto">
              Fuente oficial
            </ButtonLink>
            {showFicha && downloadableDocuments.length > 0 ? (
              <ButtonLink href="#documentos" variant="secondary" block className="sm:!inline-flex sm:w-auto">
                Ver documentos
              </ButtonLink>
            ) : null}
            {isAlert ? (
              <ButtonLink href="/alerts" variant="secondary" block className="sm:!inline-flex sm:w-auto">
                Volver a lanzamientos
              </ButtonLink>
            ) : null}
          </div>

          <div className="mt-3 rounded-xl border border-[var(--stroke)] bg-[var(--bg-eco)]/60 p-3.5">
            <p className="text-sm font-bold text-[var(--ink)]">¿Quieres enterarte del siguiente antes?</p>
            <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
              Con {proPlan.name} recibes avisos por email y SMS, y el curso Guía VPO.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
              <ButtonLink href="/alerts" variant="secondary">Ver próximos lanzamientos</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {showFicha ? (
      <section className="grid gap-4 md:gap-6">
      <article className="premium-card p-4 md:p-6">
        <SectionHeader
          eyebrow="Ficha estructurada"
          title="Información, requisitos, ubicación y documentación"
          description={promotion.publicDescription || 'Estamos completando esta ficha para ofrecerte la información más útil posible.'}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Informacion general</h2>
            <div className="mt-3 space-y-1.5 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
              <p>Tipo: {promotion.promotionType}</p>
              <p>Promotor: {promotion.promoter || 'n/d'}</p>
              <p>Total viviendas: {promotion.totalHomes ?? 'n/d'}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Descripcion</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-[var(--ink)]">
              {promotion.publicDescription ||
                'Estamos completando esta ficha para ofrecerte la información más útil posible.'}
            </p>
          </div>
        </div>

        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4" aria-label="Galería multimedia">
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Imágenes</p>
            <p className="mt-2 text-2xl font-black text-[var(--ink)]">{documentsByType.images.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Vídeos</p>
            <p className="mt-2 text-2xl font-black text-[var(--ink)]">{documentsByType.videos.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">Planos</p>
            <p className="mt-2 text-2xl font-black text-[var(--ink)]">{documentsByType.plans.length}</p>
          </SurfaceCard>
          <SurfaceCard className="p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--green-700)]">PDFs</p>
            <p className="mt-2 text-2xl font-black text-[var(--ink)]">{documentsByType.pdfs.length}</p>
          </SurfaceCard>
        </section>

        {documentsByType.images.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Galería</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {documentsByType.images.slice(0, 6).map((doc) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={doc.id}
                  src={doc.publicUrl}
                  alt={doc.altText || doc.title || doc.originalName || ''}
                  className="h-56 w-full rounded-2xl object-cover shadow-sm"
                />
              ))}
            </div>
          </section>
        ) : null}

        {documentsByType.videos.length > 0 ? (
          <section className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Vídeos</h2>
            <div className="mt-3 grid gap-3">
              {documentsByType.videos.map((doc) => (
                <video key={doc.id} src={doc.publicUrl} controls className="aspect-video w-full rounded-2xl bg-black" />
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <DataBlock title="Fechas" payload={promotion.importantDates} />
          <DataBlock title="Requisitos" payload={promotion.requirements} />
          <DataBlock title="Economia" payload={promotion.economicInfo} />
          <DataBlock title="Contacto" payload={promotion.contactInfo} />
          <DataBlock title="Cuotas y reservas" payload={promotion.feesAndReservations} wide />
        </div>

        <InlineAdCard className="mt-4" />

        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Tabla de viviendas</h2>
          {promotion.units.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Pendiente de revision manual.</p>
          ) : (
            <>
              <p className="mt-2 text-xs text-[var(--ink-soft)] md:hidden">Desliza horizontalmente para ver todas las columnas.</p>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-[var(--stroke)] bg-white/90">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--stroke)] bg-[var(--bg-app)]">
                    <th className="p-3 text-left text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Vivienda</th>
                    <th className="p-3 text-left">Régimen</th>
                    <th className="p-3 text-left">Tipología</th>
                    <th className="p-2 text-left">Escalera</th>
                    <th className="p-2 text-left">Planta</th>
                    <th className="p-2 text-left">Puerta</th>
                    <th className="p-3 text-left">Sup. útil</th>
                    <th className="p-3 text-left">Precio/Renta</th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.units.map((row, index) => (
                    <tr key={row.id} className="border-b border-[var(--stroke)] last:border-b-0">
                      <td className="p-3 font-semibold text-[var(--ink)]">{row.unitLabel || `#${index + 1}`}</td>
                      <td className="p-3">{String(row.extraData?.regUs || row.extraData?.regimenUso || 'n/d')}</td>
                      <td className="p-3">{String(row.extraData?.tip || row.extraData?.tipologia || 'n/d')}</td>
                      <td className="p-2">{row.stair || 'n/d'}</td>
                      <td className="p-2">{row.floor || 'n/d'}</td>
                      <td className="p-2">{row.door || 'n/d'}</td>
                      <td className="p-3">{row.usefulAreaM2 ?? 'n/d'}</td>
                      <td className="p-3">{row.priceSale ?? row.monthlyRent ?? 'n/d'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </div>

        <div id="documentos" className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Documentos de referencia</h2>
          {downloadableDocuments.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Sin documentos adjuntos.</p>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {downloadableDocuments.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--bg-eco)]"
                >
                  {doc.originalName || doc.documentKind}
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
      </section>
      ) : null}

      <ProComparison compact title="¿Te interesa llegar antes la próxima vez?" />
    </main>
  );
}
