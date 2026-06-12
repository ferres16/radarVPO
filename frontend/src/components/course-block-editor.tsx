'use client';

import { useMemo, useState } from 'react';
import { CourseBlockRenderer } from '@/components/course-block-renderer';
import { api } from '@/lib/api';
import type { CourseAsset, CourseAssetKind, CourseContentBlock, CourseContentBlockType } from '@/types';

const blockTypes: Array<{ type: CourseContentBlockType; label: string }> = [
  { type: 'heading', label: 'Título' },
  { type: 'paragraph', label: 'Párrafo' },
  { type: 'image', label: 'Imagen' },
  { type: 'video', label: 'Vídeo' },
  { type: 'document', label: 'PDF/documento' },
  { type: 'list', label: 'Lista' },
  { type: 'quote', label: 'Cita' },
  { type: 'divider', label: 'Separador' },
  { type: 'callout', label: 'Aviso' },
  { type: 'button', label: 'Botón' },
  { type: 'gallery', label: 'Galería' },
  { type: 'attachments', label: 'Adjuntos' },
];

const defaultContent: Record<CourseContentBlockType, Record<string, unknown>> = {
  heading: { text: 'Nuevo título', level: 2 },
  paragraph: { text: 'Escribe el contenido de este párrafo.' },
  image: { assetId: '', alt: '', caption: '' },
  video: { assetId: '', src: '', caption: '' },
  document: { assetId: '', label: '' },
  list: { items: ['Primer punto', 'Segundo punto'], style: 'bullet' },
  quote: { text: 'Cita destacada', attribution: '' },
  divider: {},
  callout: { title: 'Aviso', text: 'Texto del aviso' },
  button: { label: 'Abrir enlace', href: '' },
  gallery: {},
  attachments: {},
};

function inputValue(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function assetKindForType(type: CourseContentBlockType): CourseAssetKind {
  if (type === 'image' || type === 'gallery') return 'image';
  if (type === 'video') return 'video';
  if (type === 'document') return 'document';
  return 'attachment';
}

type CourseBlockEditorProps = {
  lessonId: string;
  blocks?: CourseContentBlock[];
  onChange: (blocks: CourseContentBlock[]) => void;
  onError?: (message: string) => void;
};

export function CourseBlockEditor({ lessonId, blocks = [], onChange, onError }: CourseBlockEditorProps) {
  const [creatingType, setCreatingType] = useState<CourseContentBlockType>('paragraph');
  const [savingId, setSavingId] = useState('');
  const [preview, setPreview] = useState(true);
  const orderedBlocks = useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks]);

  const reportError = (err: unknown, fallback: string) => {
    onError?.(err instanceof Error ? err.message : fallback);
  };

  const replaceBlock = (updated: CourseContentBlock) => {
    onChange(orderedBlocks.map((block) => (block.id === updated.id ? updated : block)));
  };

  async function createBlock() {
    setSavingId('new-block');
    try {
      const created = await api.createBackofficeCourseContentBlock(lessonId, {
        type: creatingType,
        content: defaultContent[creatingType],
        order: orderedBlocks.length,
      });
      onChange([...orderedBlocks, created]);
    } catch (err) {
      reportError(err, 'No se pudo crear el bloque');
    } finally {
      setSavingId('');
    }
  }

  async function updateBlock(block: CourseContentBlock, content: Record<string, unknown>) {
    setSavingId(block.id);
    try {
      replaceBlock(await api.updateBackofficeCourseContentBlock(block.id, { content }));
    } catch (err) {
      reportError(err, 'No se pudo guardar el bloque');
    } finally {
      setSavingId('');
    }
  }

  async function deleteBlock(blockId: string) {
    if (!window.confirm('Se eliminará el bloque y sus archivos en S3. ¿Continuar?')) return;
    setSavingId(blockId);
    try {
      await api.deleteBackofficeCourseContentBlock(blockId);
      onChange(orderedBlocks.filter((block) => block.id !== blockId));
    } catch (err) {
      reportError(err, 'No se pudo eliminar el bloque');
    } finally {
      setSavingId('');
    }
  }

  async function moveBlock(blockId: string, direction: -1 | 1) {
    const index = orderedBlocks.findIndex((block) => block.id === blockId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= orderedBlocks.length) return;
    const next = [...orderedBlocks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next.map((block, order) => ({ ...block, order })));
    try {
      onChange(await api.reorderBackofficeCourseContentBlocks(lessonId, next.map((block) => block.id)));
    } catch (err) {
      reportError(err, 'No se pudo reordenar los bloques');
      onChange(orderedBlocks);
    }
  }

  async function uploadAsset(block: CourseContentBlock, file: File) {
    setSavingId(`${block.id}-asset`);
    try {
      const asset = await api.uploadBackofficeCourseBlockAsset(block.id, assetKindForType(block.type), file);
      const assets = [...(block.assets || []), asset];
      const content = ['image', 'video', 'document'].includes(block.type)
        ? { ...block.content, assetId: asset.id }
        : block.content;
      replaceBlock({ ...block, assets, content });
      if (content !== block.content) {
        const updated = await api.updateBackofficeCourseContentBlock(block.id, { content });
        replaceBlock({ ...updated, assets });
      }
    } catch (err) {
      reportError(err, 'No se pudo subir el archivo');
    } finally {
      setSavingId('');
    }
  }

  async function deleteAsset(block: CourseContentBlock, assetId: string) {
    if (!window.confirm('Se eliminará este archivo de S3. ¿Continuar?')) return;
    setSavingId(assetId);
    try {
      await api.deleteBackofficeCourseAsset(assetId);
      replaceBlock({ ...block, assets: (block.assets || []).filter((asset) => asset.id !== assetId) });
    } catch (err) {
      reportError(err, 'No se pudo eliminar el archivo');
    } finally {
      setSavingId('');
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--green-700)]">Editor por bloques</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">Añade, edita, reordena y previsualiza contenido visual mezclado con texto.</p>
          </div>
          <button type="button" onClick={() => setPreview((value) => !value)} className="rounded-full border border-[var(--stroke)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
            {preview ? 'Ocultar preview' : 'Mostrar preview'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <select value={creatingType} onChange={(event) => setCreatingType(event.target.value as CourseContentBlockType)} className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2 text-sm">
            {blockTypes.map((block) => <option key={block.type} value={block.type}>{block.label}</option>)}
          </select>
          <button type="button" onClick={() => void createBlock()} disabled={savingId === 'new-block'} className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {savingId === 'new-block' ? 'Añadiendo...' : 'Añadir bloque'}
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-3">
          {orderedBlocks.map((block, index) => (
            <article key={block.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-[var(--ink)]">{blockTypes.find((item) => item.type === block.type)?.label || block.type}</p>
                  <p className="text-xs text-[var(--ink-soft)]">Orden {index + 1}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void moveBlock(block.id, -1)} className="rounded-lg border border-[var(--stroke)] px-2 py-1 text-xs">Subir</button>
                  <button type="button" onClick={() => void moveBlock(block.id, 1)} className="rounded-lg border border-[var(--stroke)] px-2 py-1 text-xs">Bajar</button>
                  <button type="button" onClick={() => void deleteBlock(block.id)} className="rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700">Eliminar</button>
                </div>
              </div>

              <BlockFields block={block} onSave={(content) => updateBlock(block, content)} saving={savingId === block.id} />

              {['image', 'video', 'document', 'gallery', 'attachments'].includes(block.type) ? (
                <div className="mt-3 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
                  <label className="inline-flex rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)]">
                    {savingId === `${block.id}-asset` ? 'Subiendo...' : 'Subir archivo'}
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,video/mp4,application/pdf" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      void uploadAsset(block, file);
                      event.currentTarget.value = '';
                    }} />
                  </label>
                  {block.assets?.length ? (
                    <div className="mt-3 grid gap-2">
                      {block.assets.map((asset) => (
                        <AssetRow key={asset.id} asset={asset} onDelete={() => void deleteAsset(block, asset.id)} />
                      ))}
                    </div>
                  ) : <p className="mt-2 text-xs text-[var(--ink-soft)]">Sin archivos vinculados.</p>}
                </div>
              ) : null}
            </article>
          ))}
        </div>

        {preview ? (
          <aside className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--ink-soft)]">Preview</p>
              <p className="text-xs text-[var(--ink-soft)]">Vista de la lección renderizada a ancho completo.</p>
            </div>
            <CourseBlockRenderer blocks={orderedBlocks} />
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function BlockFields({ block, onSave, saving }: { block: CourseContentBlock; onSave: (content: Record<string, unknown>) => Promise<void>; saving: boolean }) {
  const [draft, setDraft] = useState<Record<string, unknown>>(() => {
    const initial = block.content || {};
    if (block.type === 'list' && Array.isArray(initial.items)) {
      return { ...initial, itemsText: initial.items.join('\n') };
    }
    return initial;
  });
  const setField = (key: string, value: unknown) => setDraft((prev) => ({ ...prev, [key]: value }));

  const commonTextArea = (key: string, label: string) => (
    <label className="text-sm font-semibold text-[var(--ink)]">
      {label}
      <textarea value={inputValue(draft[key])} onChange={(event) => setField(key, event.target.value)} className="mt-1 min-h-28 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />
    </label>
  );

  return (
    <div className="mt-4 grid gap-3">
      {block.type === 'heading' ? (
        <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
          <label className="text-sm font-semibold text-[var(--ink)]">Texto<input value={inputValue(draft.text)} onChange={(event) => setField('text', event.target.value)} className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /></label>
          <label className="text-sm font-semibold text-[var(--ink)]">Nivel<input type="number" min={2} max={4} value={inputValue(draft.level) || 2} onChange={(event) => setField('level', Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /></label>
        </div>
      ) : null}
      {block.type === 'paragraph' ? commonTextArea('text', 'Texto') : null}
      {block.type === 'quote' ? <>{commonTextArea('text', 'Cita')}<input value={inputValue(draft.attribution)} onChange={(event) => setField('attribution', event.target.value)} placeholder="Autor o contexto" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /></> : null}
      {block.type === 'callout' ? <><input value={inputValue(draft.title)} onChange={(event) => setField('title', event.target.value)} placeholder="Título del aviso" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" />{commonTextArea('text', 'Texto del aviso')}</> : null}
      {block.type === 'button' ? <div className="grid gap-3 sm:grid-cols-2"><input value={inputValue(draft.label)} onChange={(event) => setField('label', event.target.value)} placeholder="Texto del botón" className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /><input value={inputValue(draft.href)} onChange={(event) => setField('href', event.target.value)} placeholder="https://..." className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /></div> : null}
      {block.type === 'list' ? <>{commonTextArea('itemsText', 'Items, uno por línea')}<button type="button" onClick={() => setField('items', inputValue(draft.itemsText).split('\n').filter(Boolean))} className="w-fit rounded-xl border border-[var(--stroke)] px-3 py-2 text-xs font-semibold">Aplicar lista</button></> : null}
      {['image', 'video', 'document'].includes(block.type) ? <input value={inputValue(draft.caption || draft.label)} onChange={(event) => setField(block.type === 'document' ? 'label' : 'caption', event.target.value)} placeholder={block.type === 'document' ? 'Etiqueta del documento' : 'Pie de archivo'} className="rounded-xl border border-[var(--stroke)] px-3 py-2 text-sm" /> : null}
      <button type="button" onClick={() => void onSave(draft)} disabled={saving} className="w-fit rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
        {saving ? 'Guardando...' : 'Guardar bloque'}
      </button>
    </div>
  );
}

function AssetRow({ asset, onDelete }: { asset: CourseAsset; onDelete: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--stroke)] bg-white p-3 text-xs">
      <span className="font-semibold text-[var(--ink)]">{asset.originalName || asset.kind}</span>
      <span className="text-[var(--ink-soft)]">{asset.mimeType}</span>
      <button type="button" onClick={onDelete} className="rounded-lg border border-rose-200 px-2 py-1 font-semibold text-rose-700">Eliminar</button>
    </div>
  );
}
