'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { AdminNav } from '@/components/admin-nav';
import { ButtonLink, PageHero, SectionHeader, SurfaceCard } from '@/components/design-system';
import { api } from '@/lib/api';
import { PromotionDetail, PromotionDocument } from '@/types';
import { PromotionJsonImporter } from './promotion-json-importer';

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

function toJsonString(value: unknown) {
  if (!value) return '{}';
  return JSON.stringify(value, null, 2);
}

type SectionKey = 'importantDates' | 'requirements' | 'economicInfo' | 'feesAndReservations' | 'contactInfo';
type SectionRecords = Record<SectionKey, Array<{ key: string; value: string }>>;

const SECTION_META: Array<{ id: SectionKey; title: string; description: string }> = [
  { id: 'importantDates', title: 'Fechas', description: 'Apertura, cierre, sorteo, publicación provisional y otros hitos.' },
  { id: 'requirements', title: 'Requisitos', description: 'Ingresos, empadronamiento, unidad de convivencia, límites y documentación.' },
  { id: 'economicInfo', title: 'Economía', description: 'Precios, renta, entrada, financiación, IVA, reservas y costes.' },
  { id: 'feesAndReservations', title: 'Cuotas y reservas', description: 'Importes de reserva, cuotas mensuales, pagos iniciales y condiciones.' },
  { id: 'contactInfo', title: 'Contacto', description: 'Promotor, oficina, teléfono, email, enlaces y ubicación.' },
];

function recordsFromJson(value: unknown): Array<{ key: string; value: string }> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  return Object.entries(value as Record<string, unknown>).map(([key, raw]) => ({
    key,
    value: typeof raw === 'string' ? raw : JSON.stringify(raw),
  }));
}

function recordsToJson(records: Array<{ key: string; value: string }>) {
  return Object.fromEntries(
    records
      .map((row) => [row.key.trim(), row.value.trim()] as const)
      .filter(([key, value]) => key && value),
  );
}

function classifyDocument(doc: PromotionDocument) {
  if (doc.fileType?.startsWith('image/')) return 'Imagen';
  if (doc.fileType?.startsWith('video/')) return 'Vídeo';
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
  const [activeTab, setActiveTab] = useState<'summary' | 'content' | 'media' | 'preview'>('summary');

  const [form, setForm] = useState({
    title: '',
    location: '',
    municipality: '',
    province: '',
    promotionType: 'desconocido',
    promoter: '',
    totalHomes: '',
    statusMessage: '',
    publicDescription: '',
  });
  const [sections, setSections] = useState<SectionRecords>({
    importantDates: [],
    requirements: [],
    economicInfo: [],
    feesAndReservations: [],
    contactInfo: [],
  });

  async function refresh() {
    const data = await api.getBackofficePromotionById(id);
    setPromotion(data);
    hydrateFromPromotion(data);
  }

  function hydrateFromPromotion(data: PromotionDetail) {
    setForm({
      title: data.title || '',
      location: data.location || '',
      municipality: data.municipality || '',
      province: data.province || '',
      promotionType: data.promotionType,
      promoter: data.promoter || '',
      totalHomes:
        data.totalHomes === null || data.totalHomes === undefined
          ? ''
          : String(data.totalHomes),
      statusMessage: data.statusMessage || '',
      publicDescription: data.publicDescription || '',
    });
    setSections({
      importantDates: recordsFromJson(data.importantDates),
      requirements: recordsFromJson(data.requirements),
      economicInfo: recordsFromJson(data.economicInfo),
      feesAndReservations: recordsFromJson(data.feesAndReservations),
      contactInfo: recordsFromJson(data.contactInfo),
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

  useEffect(() => {
    const applyHashTab = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'documentos' || hash === 'media') {
        setActiveTab('media');
      }
      if (hash === 'contenido') {
        setActiveTab('content');
      }
    };

    applyHashTab();
    window.addEventListener('hashchange', applyHashTab);
    return () => window.removeEventListener('hashchange', applyHashTab);
  }, []);

  const documents = useMemo(() => promotion?.documents || [], [promotion]);
  const mediaGroups = useMemo(() => ({
    images: documents.filter((doc) => doc.fileType?.startsWith('image/')),
    videos: documents.filter((doc) => doc.fileType?.startsWith('video/')),
    pdfs: documents.filter((doc) => doc.fileType?.includes('pdf') || doc.documentKind === 'pdf_original'),
    documents: documents.filter((doc) => !doc.fileType?.startsWith('image/') && !doc.fileType?.startsWith('video/') && !doc.fileType?.includes('pdf')),
  }), [documents]);
  const checklist = useMemo(() => [
    { label: 'Título y municipio', done: Boolean(form.title && form.municipality) },
    { label: 'Descripción pública', done: Boolean(form.publicDescription) },
    { label: 'Fechas estructuradas', done: sections.importantDates.some((row) => row.key && row.value) },
    { label: 'Requisitos estructurados', done: sections.requirements.some((row) => row.key && row.value) },
    { label: 'PDF oficial adjunto', done: mediaGroups.pdfs.some((doc) => doc.isPublic !== false) },
    { label: 'Al menos un archivo público', done: documents.some((doc) => doc.isPublic !== false) },
  ], [documents, form.municipality, form.publicDescription, form.title, mediaGroups.pdfs, sections.importantDates, sections.requirements]);

  async function savePromotion() {
    setSaving(true);
    try {
      await api.updateBackofficePromotion(id, {
        title: form.title,
        location: form.location,
        municipality: form.municipality,
        province: form.province,
        promotionType: form.promotionType,
        promoter: form.promoter,
        totalHomes: form.totalHomes ? Number(form.totalHomes) : undefined,
        statusMessage: form.statusMessage,
        publicDescription: form.publicDescription,
        importantDatesJson: toJsonString(recordsToJson(sections.importantDates)),
        requirementsJson: toJsonString(recordsToJson(sections.requirements)),
        economicInfoJson: toJsonString(recordsToJson(sections.economicInfo)),
        feesAndReservationsJson: toJsonString(recordsToJson(sections.feesAndReservations)),
        contactInfoJson: toJsonString(recordsToJson(sections.contactInfo)),
      });
      await refresh();
      alert('Promocion actualizada');
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

  async function uploadFile(
    event: React.ChangeEvent<HTMLInputElement>,
    kind: 'pdf_original' | 'screenshot' | 'image' | 'support_document',
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    await api.uploadBackofficeDocument(id, kind, file);
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
    const accepted = window.confirm('Se eliminara el archivo tambien de S3. ¿Continuar?');
    if (!accepted) return;
    await api.deleteBackofficeDocument(id, documentId);
    await refresh();
  }

  if (loading || !promotion) {
    return (
      <main className="shell">
        <p className="text-sm text-[var(--ink-soft)]">Cargando promocion...</p>
      </main>
    );
  }

  return (
    <main className="shell pb-16">
      <div className="admin-shell">
        <AdminNav />
        <div className="space-y-5">
      <PageHero
        eyebrow="Editor modular de promoción"
        title={promotion.title}
        description="Gestiona la ficha pública por secciones: contenido, multimedia/PDF, publicación y preview. El detalle de viviendas se consulta en los PDF adjuntos."
        actions={
          <>
            <ButtonLink href={`/promotions/${promotion.id}`}>Ver ficha pública</ButtonLink>
            <ButtonLink href="/admin/promotions" variant="secondary">Volver a promociones</ButtonLink>
          </>
        }
      />

      <nav className="flex flex-wrap gap-2 rounded-3xl border border-[var(--stroke)] bg-white p-3 shadow-card">
        {[
          ['summary', 'Resumen y publicación'],
          ['content', 'Contenido estructurado'],
          ['media', 'Multimedia y documentos'],
          ['preview', 'Preview pública'],
        ].map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold ${activeTab === tab ? 'bg-[var(--green-500)] text-white' : 'bg-[var(--bg-app)] text-[var(--ink)]'}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {activeTab === 'summary' ? (
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Publicación" title="Estado editorial" description="Cambia el estado solo cuando la ficha tenga los bloques mínimos revisados." />
            <div className="mt-4 flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeStatus(status)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${promotion.status === status ? 'bg-[var(--green-500)] text-white' : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'}`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Imágenes" value={mediaGroups.images.length} />
              <Metric label="Vídeos" value={mediaGroups.videos.length} />
              <Metric label="PDFs" value={mediaGroups.pdfs.length} />
            </div>
          </SurfaceCard>
          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Checklist" title="Lista de publicación" />
            <div className="mt-4 space-y-2">
              {checklist.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3 text-sm">
                  <span className={`h-3 w-3 rounded-full ${item.done ? 'bg-[var(--green-500)]' : 'bg-amber-400'}`} />
                  <span className="font-semibold text-[var(--ink)]">{item.label}</span>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>
      ) : null}

      {activeTab === 'content' ? (
        <section id="contenido" className="space-y-4">
          <PromotionJsonImporter
            sections={sections}
            onSectionsChange={setSections}
            formPatch={form}
            onFormPatch={(patch) => setForm((current) => ({ ...current, ...patch }))}
          />

          <SurfaceCard className="p-5">
            <SectionHeader eyebrow="Ficha base" title="Información general" description="Estos datos alimentan el hero, tarjetas y resumen público." />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Field label="Título"><input className="ds-control" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
              <Field label="Ubicación"><input className="ds-control" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} /></Field>
              <Field label="Municipio"><input className="ds-control" value={form.municipality} onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))} /></Field>
              <Field label="Provincia"><input className="ds-control" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} /></Field>
              <Field label="Promotor"><input className="ds-control" value={form.promoter} onChange={(e) => setForm((f) => ({ ...f, promoter: e.target.value }))} /></Field>
              <Field label="Total viviendas"><input className="ds-control" value={form.totalHomes} onChange={(e) => setForm((f) => ({ ...f, totalHomes: e.target.value }))} /></Field>
              <Field label="Tipo de promoción">
                <select className="ds-control" value={form.promotionType} onChange={(e) => setForm((f) => ({ ...f, promotionType: e.target.value }))}>
                  <option value="desconocido">Desconocido</option>
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                  <option value="mixto">Mixto</option>
                </select>
              </Field>
              <Field label="Mensaje de estado"><textarea className="ds-control min-h-24" value={form.statusMessage} onChange={(e) => setForm((f) => ({ ...f, statusMessage: e.target.value }))} /></Field>
              <Field label="Descripción pública"><textarea className="ds-control min-h-32 md:col-span-2" value={form.publicDescription} onChange={(e) => setForm((f) => ({ ...f, publicDescription: e.target.value }))} /></Field>
            </div>
          </SurfaceCard>

          {SECTION_META.map((section) => (
            <SurfaceCard key={section.id} className="p-5">
              <SectionHeader eyebrow="Bloque estructurado" title={section.title} description={section.description} />
              <div className="mt-4 space-y-3">
                {sections[section.id].map((row, index) => (
                  <div key={`${section.id}-${index}`} className="grid gap-2 md:grid-cols-[260px_1fr_auto]">
                    <input className="ds-control" value={row.key} placeholder="Campo" onChange={(e) => setSections((prev) => ({ ...prev, [section.id]: prev[section.id].map((item, i) => i === index ? { ...item, key: e.target.value } : item) }))} />
                    <input className="ds-control" value={row.value} placeholder="Valor visible" onChange={(e) => setSections((prev) => ({ ...prev, [section.id]: prev[section.id].map((item, i) => i === index ? { ...item, value: e.target.value } : item) }))} />
                    <button type="button" className="rounded-xl border border-red-100 px-3 py-2 text-xs font-semibold text-red-700" onClick={() => setSections((prev) => ({ ...prev, [section.id]: prev[section.id].filter((_, i) => i !== index) }))}>Quitar</button>
                  </div>
                ))}
                <button type="button" className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold" onClick={() => setSections((prev) => ({ ...prev, [section.id]: [...prev[section.id], { key: '', value: '' }] }))}>Añadir campo</button>
              </div>
            </SurfaceCard>
          ))}

          <button type="button" disabled={saving} className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white disabled:opacity-50" onClick={savePromotion}>{saving ? 'Guardando...' : 'Guardar contenido'}</button>
        </section>
      ) : null}

      {activeTab === 'media' ? (
      <section id="documentos" className="space-y-4">
        <SurfaceCard className="p-5">
        <SectionHeader eyebrow="S3 Media Manager" title="Multimedia y documentos" description="Sube el PDF oficial (con el listado de viviendas) y el resto de archivos. El detalle de tipologías y precios se consulta en esos adjuntos, no en una tabla editable." />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="rounded-xl border border-dashed p-3 text-sm">
            PDF original
            <input className="mt-2 block" type="file" accept="application/pdf" onChange={(e) => uploadFile(e, 'pdf_original')} />
          </label>
          <label className="rounded-xl border border-dashed p-3 text-sm">
            Imagen de galería
            <input className="mt-2 block" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => uploadFile(e, 'image')} />
          </label>
          <label className="rounded-xl border border-dashed p-3 text-sm">
            Video
            <input className="mt-2 block" type="file" accept="video/mp4,video/quicktime" onChange={(e) => uploadFile(e, 'support_document')} />
          </label>
          <label className="rounded-xl border border-dashed p-3 text-sm">
            Documento auxiliar
            <input className="mt-2 block" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => uploadFile(e, 'support_document')} />
          </label>
        </div>
        </SurfaceCard>

        <div className="grid gap-4 lg:grid-cols-2">
          {[
            ['Imágenes', mediaGroups.images],
            ['Vídeos', mediaGroups.videos],
            ['PDFs', mediaGroups.pdfs],
            ['Otros documentos', mediaGroups.documents],
          ].map(([label, docs]) => (
            <SurfaceCard key={String(label)} className="p-4">
              <h2 className="text-lg font-semibold text-[var(--ink)]">{String(label)}</h2>
              <div className="mt-3 space-y-3">
                {(docs as PromotionDocument[]).length === 0 ? <p className="text-sm text-[var(--ink-soft)]">Sin archivos.</p> : null}
                {(docs as PromotionDocument[]).map((doc) => (
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
          ))}
        </div>
      </section>
      ) : null}

      {activeTab === 'preview' ? (
        <SurfaceCard className="p-5">
          <SectionHeader eyebrow="Preview pública" title={form.title || promotion.title} description={form.publicDescription || promotion.statusMessage} />
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="space-y-4">
              {SECTION_META.map((section) => (
                <div key={section.id} className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
                  <h3 className="font-bold text-[var(--ink)]">{section.title}</h3>
                  <dl className="mt-3 grid gap-2 md:grid-cols-2">
                    {sections[section.id].filter((row) => row.key && row.value).map((row) => (
                      <Fragment key={`${section.id}-${row.key}`}>
                        <dt className="text-xs font-semibold uppercase text-[var(--ink-soft)]">{row.key}</dt>
                        <dd className="text-sm text-[var(--ink)]">{row.value}</dd>
                      </Fragment>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
            <aside className="space-y-3">
              {mediaGroups.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaGroups.images[0].publicUrl} alt={mediaGroups.images[0].altText || ''} className="h-56 w-full rounded-3xl object-cover" />
              ) : null}
              <Metric label="Documentos públicos" value={documents.filter((doc) => doc.isPublic !== false).length} />
              <Metric label="PDFs" value={mediaGroups.pdfs.length} />
            </aside>
          </div>
        </SurfaceCard>
      ) : null}
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="text-sm font-semibold text-[var(--ink)]"><span>{label}</span><div className="mt-1">{children}</div></label>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">{label}</p>
      <p className="display-type mt-1 text-2xl font-black text-[var(--ink)]">{value}</p>
    </div>
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
    description: doc.description || '',
    altText: doc.altText || '',
    sortOrder: String(doc.sortOrder ?? 0),
    section: doc.section || '',
    isFeatured: Boolean(doc.isFeatured),
    isPublic: doc.isPublic !== false,
  });

  useEffect(() => {
    setDraft({
      title: doc.title || doc.originalName || '',
      description: doc.description || '',
      altText: doc.altText || '',
      sortOrder: String(doc.sortOrder ?? 0),
      section: doc.section || '',
      isFeatured: Boolean(doc.isFeatured),
      isPublic: doc.isPublic !== false,
    });
  }, [doc]);

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-700)]">{classifyDocument(doc)}</p>
          {doc.publicUrl ? (
            <a href={doc.publicUrl} target="_blank" rel="noreferrer" className="mt-1 block font-semibold text-[var(--ink)] underline">{doc.originalName || doc.publicUrl}</a>
          ) : (
            <p className="mt-1 font-semibold text-[var(--ink)]">{doc.originalName || 'Archivo sin URL pública'}</p>
          )}
          {doc.fileType?.startsWith('image/') && doc.publicUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.publicUrl} alt={doc.altText || ''} className="mt-3 h-32 w-48 rounded-xl object-cover" />
          ) : null}
          {doc.fileType?.startsWith('video/') && doc.publicUrl ? (
            <video src={doc.publicUrl} controls className="mt-3 h-32 w-48 rounded-xl bg-black" />
          ) : null}
        </div>
        <button type="button" onClick={onDelete} className="rounded-lg border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50">Eliminar S3</button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input className="ds-control" value={draft.title} placeholder="Título editorial" onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))} />
        <input className="ds-control" value={draft.altText} placeholder="Alt text" onChange={(e) => setDraft((prev) => ({ ...prev, altText: e.target.value }))} />
        <input className="ds-control" value={draft.section} placeholder="Sección: galeria, planos, requisitos..." onChange={(e) => setDraft((prev) => ({ ...prev, section: e.target.value }))} />
        <input className="ds-control" type="number" value={draft.sortOrder} placeholder="Orden" onChange={(e) => setDraft((prev) => ({ ...prev, sortOrder: e.target.value }))} />
        <textarea className="ds-control min-h-20 md:col-span-2" value={draft.description} placeholder="Descripción interna o pública" onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]"><input type="checkbox" checked={draft.isFeatured} onChange={(e) => setDraft((prev) => ({ ...prev, isFeatured: e.target.checked }))} /> Destacado</label>
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--ink)]"><input type="checkbox" checked={draft.isPublic} onChange={(e) => setDraft((prev) => ({ ...prev, isPublic: e.target.checked }))} /> Público</label>
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
