import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
import { api } from '@/lib/api';
import { copy } from '@/lib/navigation';
import { isAlertPromotion } from '@/lib/promotion-access';
import { isAmendmentPublication } from '@/lib/promotion-content-filters';
import { getViewableDocuments } from '@/lib/promotion-documents';
import { ButtonLink } from '@/components/design-system';
import { PromotionPdfViewer } from '@/components/pdf-viewer/promotion-pdf-viewer';
import { SavePromotionButton } from '@/components/save-promotion-button';
import { StructuredData } from '@/components/structured-data';
import { pdfNextStep } from '@/lib/conversion';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';

type PromotionDetailParams = {
  params: Promise<{ id: string }>;
};

const getPromotion = cache(async (id: string) => {
  return api.getPromotionById(id).catch(() => null);
});

function formatPublicationDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
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
    description: `Documento oficial de la promoción de vivienda protegida en ${location}: bases y anexos publicados en la fuente oficial.`,
    path: `/promotions/${promotion.id}`,
    keywords: ['promociones VPO', location, promotion.promotionType, 'vivienda protegida'],
  });
}

export default async function PromotionDetailPage({ params }: PromotionDetailParams) {
  const { id } = await params;
  const promotion = await getPromotion(id);

  if (!promotion) {
    return notFound();
  }

  if (isAmendmentPublication(promotion.title, promotion.publicDescription)) {
    return notFound();
  }

  if (isAlertPromotion(promotion)) {
    redirect('/alerts');
  }

  const documents = getViewableDocuments(promotion.documents);
  const publishedOn = formatPublicationDate(promotion.publishedAt);
  const place = [promotion.municipality, promotion.province].filter(Boolean).join(', ');

  return (
    <main className="shell space-y-4 pb-6 md:space-y-6 md:pb-8">
      <StructuredData
        data={breadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: copy.publishedPromotions, path: '/promotions' },
          { name: promotion.title, path: `/promotions/${promotion.id}` },
        ])}
      />

      <header className="premium-card p-4 md:p-6">
        <h1 className="display-type text-xl font-black leading-snug text-[var(--ink)] sm:text-2xl md:text-[1.75rem]">
          {promotion.title}
        </h1>
        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">
          {[place, publishedOn ? `Publicada el ${publishedOn}` : null].filter(Boolean).join(' · ')}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-start">
          <ButtonLink
            href={promotion.sourceUrl}
            variant="secondary"
            block
            className="sm:!inline-flex sm:w-auto"
          >
            Fuente oficial
          </ButtonLink>
          <SavePromotionButton promotionId={promotion.id} />
        </div>
      </header>

      {documents.length > 0 ? (
        <PromotionPdfViewer
          promotionId={promotion.id}
          documents={documents}
          sourceUrl={promotion.sourceUrl}
        />
      ) : (
        <section className="premium-card p-5 text-center md:p-8" aria-live="polite">
          <h2 className="text-lg font-bold text-[var(--ink)]">
            Esta promoción todavía no tiene un PDF asociado
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
            Consulta la publicación original en la fuente oficial. Cuando el documento esté
            disponible aquí, podrás leerlo sin salir de Radar VPO.
          </p>
          <div className="mt-4 flex justify-center">
            <ButtonLink href={promotion.sourceUrl} variant="primary">
              Ver fuente oficial
            </ButtonLink>
          </div>
        </section>
      )}

      <section className="premium-card p-4 md:p-6" aria-labelledby="pdf-next-title">
        <h2 id="pdf-next-title" className="text-lg font-bold text-[var(--ink)]">
          {pdfNextStep.title}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">{pdfNextStep.description}</p>
        <div className="mt-4">
          <ButtonLink href={pdfNextStep.href}>{pdfNextStep.cta}</ButtonLink>
        </div>
      </section>

      <p className="px-1 text-xs leading-5 text-[var(--ink-soft)]">
        Documentos publicados por la administración y mostrados tal cual. Radar VPO es un servicio
        independiente; las bases oficiales son siempre la referencia.
      </p>
    </main>
  );
}
