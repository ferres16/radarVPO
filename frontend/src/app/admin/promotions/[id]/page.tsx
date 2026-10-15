'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import { PromotionDetail, PromotionDocument } from '@/types';

const STATUS_OPTIONS: PromotionDetail['status'][] = [
  'pending_review',
  'published_unreviewed',
  'published_reviewed',
  'archived',
];

const STATUS_LABELS: Record<PromotionDetail['status'], string> = {
  pending_review: 'Aviso pendiente',
  published_unreviewed: 'Publicada sin revisar',
  published_reviewed: 'Publicada revisada',
  archived: 'Archivada',
};

function classifyDocument(doc: PromotionDocument) {
  if (doc.fileType?.startsWith('image/')) return 'Imagen (no se muestra en la web pública)';
  if (doc.fileType?.startsWith('video/')) return 'Vídeo (no se muestra en la web pública)';
  if (doc.fileType?.includes('pdf')) return 'PDF';
  return 'Documento';
}

export default function AdminPromotionEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDocumentId, setSavingDocumentId] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'documents'>('summary');

  const [form, setForm] = useState({
    title: '',
    municipality: '',
    province: '',
    promotionType: 'desconocido',
  });

  async function refresh() {
    const data = await api.getBackofficePromotionById(id);
    setPromotion(data);
    hydrateFromPromotion(data);
  }

  function hydrateFromPromotion(data: PromotionDetail) {
    setForm({
      title: data.title || '',
      municipality: data.municipality || '',
      province: data.province || '',
      promotionType: data.promotionType,
    });
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getBackofficePromotionById(id);
        if (!active) return;
        setPromotion(data);
        hydrateFromPromotion(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const documents = useMemo(() => promotion?.documents || [], [promotion]);
  const pdfs = useMemo(
    () =>
      documents.filter(
        (doc) => doc.fileType?.includes('pdf') || doc.documentKind === 'pdf_original',
      ),
    [documents],
  );
  const otherFiles = useMemo(
    () =>
      documents.filter(
        (doc) => !doc.fileType?.includes('pdf') && doc.documentKind !== 'pdf_original',
      ),
    [documents],
  );

  async function savePromotion() {
    setSaving(true);
    try {
      await api.updateBackofficePromotion(id, {
        title: form.title,
        municipality: form.municipality,
        province: form.province,
        promotionType: form.promotionType,
      });
      await refresh();
      alert('Metadatos actualizados. La ficha pública muestra el PDF oficial, no estos campos.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(status: PromotionDetail['status']) {
    await api.updateBackofficePromotionStatus(id, status);
    await refresh();
  }

  async function uploadPdf(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await api.uploadBackofficeDocument(id, 'pdf_original', file);
    event.target.value = '';
    await refresh();
  }

  async function saveDocument(document: PromotionDocument, patch: Partial<PromotionDocument>) {
    setSavingDocumentId(document.id);
    try {
      await api.updateBackofficeDocument(id, document.id, patch);
      await refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo actualizar el archivo');
    } finally {
      setSavingDocumentId('');
    }
  }

  async function removeDocument(documentId: string) {
    const accepted = window.confirm('Se eliminará el archivo también de S3. ¿Continuar?');
    if (!accepted) return;
    await api.deleteBackofficeDocument(id, documentId);
    await refresh();
  }

  if (loading || !promotion) {
    return (
      <main className="shell">
        <p className="text-sm text-[var(--ink-soft)]">Cargando promoción...</p>
      </main>
    );
  }

  const publishedOn = promotion.publishedAt ? promotion.publishedAt.slice(0, 10) : null;

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-5">
          <PageHero
            eyebrow="Promoción"
            title={promotion.title}
            description="La web pública muestra el PDF oficial con una cabecera mínima. Aquí solo se editan metadatos de listado y los documentos asociados. Los bloques estructurados históricos se conservan en base de datos y ya no se editan."
            actions={
              <>
                <ButtonLink href={`/promotions/${promotion.id}`}>Ver PDF público</ButtonLink>
                <ButtonLink href="/admin/promotions" variant="secondary">
                  Volver a promociones
                </ButtonLink>
              </>
            }
          />

          <nav className="flex flex-wrap gap-2 rounded-3xl border border-[var(--stroke)] bg-white p-3">
            {[
              ['summary', 'Metadatos y publicación'],
              ['documents', 'Documentos oficiales'],
            ].map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                  activeTab === tab
                    ? 'bg-[var(--green-500)] text-white'
                    : 'bg-[var(--bg-app)] text-[var(--ink)]'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {activeTab === 'summary' ? (
            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <SurfaceCard className="p-5">
                <SectionHeader
                  eyebrow="Listado"
                  title="Cabecera pública"
                  description="Estos datos aparecen en la tarjeta y en la cabecera del visor. Si un dato no consta, déjalo vacío."
                />
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <Field label="Título">
                    <input
                      className="ds-control"
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </Field>
                  <Field label="Municipio">
                    <input
                      className="ds-control"
                      value={form.municipality}
                      onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))}
                    />
                  </Field>
                  <Field label="Provincia">
                    <input
                      className="ds-control"
                      value={form.province}
                      onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
                    />
                  </Field>
                  <Field label="Tipo de promoción">
                    <select
                      className="ds-control"
                      value={form.promotionType}
                      onChange={(e) => setForm((f) => ({ ...f, promotionType: e.target.value }))}
                    >
                      <option value="desconocido">Desconocido</option>
                      <option value="venta">Venta</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </Field>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  className="mt-4 rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white disabled:opacity-50"
                  onClick={() => void savePromotion()}
                >
                  {saving ? 'Guardando...' : 'Guardar metadatos'}
                </button>
              </SurfaceCard>

              <SurfaceCard className="p-5">
                <SectionHeader eyebrow="Publicación" title="Estado editorial" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void changeStatus(status)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        promotion.status === status
                          ? 'bg-[var(--green-500)] text-white'
                          : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'
                      }`}
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
                <dl className="mt-5 space-y-2 text-sm">
                  {publishedOn ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Fecha de publicación
                      </dt>
                      <dd className="mt-1 text-[var(--ink)]">{publishedOn}</dd>
                    </div>
                  ) : null}
                  {promotion.sourceUrl ? (
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Fuente oficial
                      </dt>
                      <dd className="mt-1 break-all">
                        <a
                          href={promotion.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[var(--green-700)] underline"
                        >
                          {promotion.sourceUrl}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                      PDFs públicos
                    </dt>
                    <dd className="mt-1 text-[var(--ink)]">
                      {pdfs.filter((doc) => doc.isPublic !== false).length}
                    </dd>
                  </div>
                </dl>
              </SurfaceCard>
            </section>
          ) : null}

          {activeTab === 'documents' ? (
            <section className="space-y-4">
              <SurfaceCard className="p-5">
                <SectionHeader
                  eyebrow="Documento oficial"
                  title="PDF de la promoción"
                  description="Adjunta las bases, anexos y modificaciones. La vista pública abre estos archivos en el visor."
                />
                <label className="mt-4 block rounded-xl border border-dashed p-4 text-sm">
                  Añadir PDF
                  <input className="mt-2 block" type="file" accept="application/pdf" onChange={(e) => void uploadPdf(e)} />
                </label>
              </SurfaceCard>

              <SurfaceCard className="p-4">
                <h2 className="text-lg font-semibold text-[var(--ink)]">PDFs</h2>
                <div className="mt-3 space-y-3">
                  {pdfs.length === 0 ? (
                    <p className="text-sm text-[var(--ink-soft)]">Sin PDF asociados.</p>
                  ) : (
                    pdfs.map((doc) => (
                      <DocumentEditorRow
                        key={doc.id}
                        doc={doc}
                        saving={savingDocumentId === doc.id}
                        onSave={(patch) => void saveDocument(doc, patch)}
                        onDelete={() => void removeDocument(doc.id)}
                      />
                    ))
                  )}
                </div>
              </SurfaceCard>

              {otherFiles.length > 0 ? (
                <SurfaceCard className="p-4">
                  <h2 className="text-lg font-semibold text-[var(--ink)]">Archivos históricos (no públicos)</h2>
                  <p className="mt-1 text-sm text-[var(--ink-soft)]">
                    Imágenes, vídeos u otros adjuntos de la ficha antigua. No se muestran en la web. Puedes
                    dejarlos o eliminarlos.
                  </p>
                  <div className="mt-3 space-y-3">
                    {otherFiles.map((doc) => (
                      <DocumentEditorRow
                        key={doc.id}
                        doc={doc}
                        saving={savingDocumentId === doc.id}
                        onSave={(patch) => void saveDocument(doc, patch)}
                        onDelete={() => void removeDocument(doc.id)}
                      />
                    ))}
                  </div>
                </SurfaceCard>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-[var(--ink)]">
      <span>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function DocumentEditorRow({
  doc,
  saving,
  onSave,
  onDelete,
}: {
  doc: PromotionDocument;
  saving: boolean;
  onSave: (patch: Partial<PromotionDocument>) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState({
    title: doc.title || doc.originalName || '',
    sortOrder: String(doc.sortOrder ?? 0),
    isPublic: doc.isPublic !== false,
  });

  useEffect(() => {
    setDraft({
      title: doc.title || doc.originalName || '',
      sortOrder: String(doc.sortOrder ?? 0),
      isPublic: doc.isPublic !== false,
    });
  }, [doc]);

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-700)]">
            {classifyDocument(doc)}
          </p>
          {doc.publicUrl ? (
            <a
              href={doc.publicUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block font-semibold text-[var(--ink)] underline"
            >
              {doc.originalName || doc.publicUrl}
            </a>
          ) : (
            <p className="mt-1 font-semibold text-[var(--ink)]">{doc.originalName || 'Archivo sin URL pública'}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input
          className="ds-control"
          value={draft.title}
          placeholder="Título visible en el visor (bases, anexo…)"
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
        />
        <input
          className="ds-control"
          type="number"
          value={draft.sortOrder}
          placeholder="Orden"
          onChange={(e) => setDraft((prev) => ({ ...prev, sortOrder: e.target.value }))}
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]">
          <input
            type="checkbox"
            checked={draft.isPublic}
            onChange={(e) => setDraft((prev) => ({ ...prev, isPublic: e.target.checked }))}
          />{' '}
          Público
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => onSave({ ...draft, sortOrder: Number(draft.sortOrder) || 0 })}
          className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Guardando...' : 'Guardar metadatos'}
        </button>
      </div>
    </div>
  );
}
