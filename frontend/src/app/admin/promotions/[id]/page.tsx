'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PromotionDetail, PromotionUnit } from '@/types';

const STATUS_OPTIONS: PromotionDetail['status'][] = [
  'detected',
  'pending_review',
  'published',
  'archived',
];

function toJsonString(value: unknown) {
  if (!value) return '{}';
  return JSON.stringify(value, null, 2);
}

export default function AdminPromotionEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pasteBuffer, setPasteBuffer] = useState('');

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
    availableUnitsText: '',
    importantDatesJson: '{}',
    requirementsJson: '{}',
    economicInfoJson: '{}',
    feesAndReservationsJson: '{}',
    contactInfoJson: '{}',
  });

  async function refresh() {
    const data = await api.getBackofficePromotionById(id);
    setPromotion(data);
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
      availableUnitsText: data.availableUnitsText || '',
      importantDatesJson: toJsonString(data.importantDates),
      requirementsJson: toJsonString(data.requirements),
      economicInfoJson: toJsonString(data.economicInfo),
      feesAndReservationsJson: toJsonString(data.feesAndReservations),
      contactInfoJson: toJsonString(data.contactInfo),
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
          availableUnitsText: data.availableUnitsText || '',
          importantDatesJson: toJsonString(data.importantDates),
          requirementsJson: toJsonString(data.requirements),
          economicInfoJson: toJsonString(data.economicInfo),
          feesAndReservationsJson: toJsonString(data.feesAndReservations),
          contactInfoJson: toJsonString(data.contactInfo),
        });
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  const units = useMemo(() => promotion?.units || [], [promotion]);

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
        availableUnitsText: form.availableUnitsText,
        importantDatesJson: form.importantDatesJson,
        requirementsJson: form.requirementsJson,
        economicInfoJson: form.economicInfoJson,
        feesAndReservationsJson: form.feesAndReservationsJson,
        contactInfoJson: form.contactInfoJson,
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

  async function createUnit() {
    await api.createBackofficeUnit(id, {
      unitLabel: 'Nueva fila',
    });
    await refresh();
  }

  async function updateUnit(unitId: string, patch: Partial<PromotionUnit>) {
    await api.updateBackofficeUnit(id, unitId, patch);
    await refresh();
  }

  async function removeUnit(unitId: string) {
    await api.deleteBackofficeUnit(id, unitId);
    await refresh();
  }

  async function duplicateUnit(unitId: string) {
    await api.duplicateBackofficeUnit(id, unitId);
    await refresh();
  }

  async function moveUnit(unitId: string, direction: -1 | 1) {
    const index = units.findIndex((u) => u.id === unitId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= units.length) return;

    const next = [...units];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;

    await api.reorderBackofficeUnits(
      id,
      next.map((u) => u.id),
    );
    await refresh();
  }

  async function importPaste() {
    if (!pasteBuffer.trim()) return;
    await api.importBackofficeUnits(id, pasteBuffer);
    setPasteBuffer('');
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

  if (loading || !promotion) {
    return (
      <main className="shell">
        <p className="text-sm text-[var(--ink-soft)]">Cargando promocion...</p>
      </main>
    );
  }

  return (
    <main className="shell space-y-5 pb-12">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-5 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Editor de promocion</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{promotion.title}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => changeStatus(status)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                promotion.status === status
                  ? 'bg-[var(--green-500)] text-white'
                  : 'border border-[var(--stroke)] bg-white text-[var(--ink)]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Informacion general</h2>
          <div className="mt-3 space-y-2 text-sm">
            <input className="w-full rounded-lg border p-2" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titulo" />
            <input className="w-full rounded-lg border p-2" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} placeholder="Ubicacion" />
            <input className="w-full rounded-lg border p-2" value={form.municipality} onChange={(e) => setForm((f) => ({ ...f, municipality: e.target.value }))} placeholder="Municipio" />
            <input className="w-full rounded-lg border p-2" value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))} placeholder="Provincia" />
            <input className="w-full rounded-lg border p-2" value={form.promoter} onChange={(e) => setForm((f) => ({ ...f, promoter: e.target.value }))} placeholder="Promotor" />
            <input className="w-full rounded-lg border p-2" value={form.totalHomes} onChange={(e) => setForm((f) => ({ ...f, totalHomes: e.target.value }))} placeholder="Total viviendas" />
            <select className="w-full rounded-lg border p-2" value={form.promotionType} onChange={(e) => setForm((f) => ({ ...f, promotionType: e.target.value }))}>
              <option value="desconocido">desconocido</option>
              <option value="venta">venta</option>
              <option value="alquiler">alquiler</option>
              <option value="mixto">mixto</option>
            </select>
            <textarea className="min-h-20 w-full rounded-lg border p-2" value={form.statusMessage} onChange={(e) => setForm((f) => ({ ...f, statusMessage: e.target.value }))} placeholder="Mensaje visible para usuario" />
            <textarea className="min-h-28 w-full rounded-lg border p-2" value={form.publicDescription} onChange={(e) => setForm((f) => ({ ...f, publicDescription: e.target.value }))} placeholder="Descripcion publica" />
            <textarea className="min-h-40 w-full rounded-lg border p-2" value={form.availableUnitsText} onChange={(e) => setForm((f) => ({ ...f, availableUnitsText: e.target.value }))} placeholder="Recuadro viviendas disponibles (texto plano)" />
          </div>
        </article>

        <article className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Bloques JSON</h2>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">Edita por bloques: fechas, requisitos, economia, contacto y cuotas/reservas.</p>
          <div className="mt-3 space-y-2">
            <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={form.importantDatesJson} onChange={(e) => setForm((f) => ({ ...f, importantDatesJson: e.target.value }))} />
            <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={form.requirementsJson} onChange={(e) => setForm((f) => ({ ...f, requirementsJson: e.target.value }))} />
            <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={form.economicInfoJson} onChange={(e) => setForm((f) => ({ ...f, economicInfoJson: e.target.value }))} />
            <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={form.feesAndReservationsJson} onChange={(e) => setForm((f) => ({ ...f, feesAndReservationsJson: e.target.value }))} />
            <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={form.contactInfoJson} onChange={(e) => setForm((f) => ({ ...f, contactInfoJson: e.target.value }))} />
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Tabla de viviendas</h2>
          <button className="rounded-lg bg-[var(--green-500)] px-3 py-2 text-xs font-semibold text-white" onClick={createUnit}>Anadir fila</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Unidad</th>
                <th className="p-2 text-left">Planta</th>
                <th className="p-2 text-left">Puerta</th>
                <th className="p-2 text-left">Hab</th>
                <th className="p-2 text-left">Alquiler</th>
                <th className="p-2 text-left">Reserva</th>
                <th className="p-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id} className="border-b align-top">
                  <td className="p-2"><input className="w-32 rounded border p-1" defaultValue={unit.unitLabel || ''} onBlur={(e) => updateUnit(unit.id, { unitLabel: e.target.value })} /></td>
                  <td className="p-2"><input className="w-20 rounded border p-1" defaultValue={unit.floor || ''} onBlur={(e) => updateUnit(unit.id, { floor: e.target.value })} /></td>
                  <td className="p-2"><input className="w-20 rounded border p-1" defaultValue={unit.door || ''} onBlur={(e) => updateUnit(unit.id, { door: e.target.value })} /></td>
                  <td className="p-2"><input className="w-16 rounded border p-1" defaultValue={unit.bedrooms || ''} onBlur={(e) => updateUnit(unit.id, { bedrooms: Number(e.target.value || 0) || undefined })} /></td>
                  <td className="p-2"><input className="w-24 rounded border p-1" defaultValue={String(unit.monthlyRent || '')} onBlur={(e) => updateUnit(unit.id, { monthlyRent: Number(e.target.value || 0) || undefined })} /></td>
                  <td className="p-2"><input className="w-24 rounded border p-1" defaultValue={String(unit.reservation || '')} onBlur={(e) => updateUnit(unit.id, { reservation: Number(e.target.value || 0) || undefined })} /></td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => moveUnit(unit.id, -1)}>Subir</button>
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => moveUnit(unit.id, 1)}>Bajar</button>
                      <button className="rounded border px-2 py-1 text-xs" onClick={() => duplicateUnit(unit.id)}>Duplicar</button>
                      <button className="rounded border px-2 py-1 text-xs text-red-700" onClick={() => removeUnit(unit.id)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold">Importar por pegado manual (CSV/TSV con cabecera)</p>
          <textarea className="min-h-24 w-full rounded-lg border p-2 font-mono text-xs" value={pasteBuffer} onChange={(e) => setPasteBuffer(e.target.value)} />
          <button className="mt-2 rounded-lg border px-3 py-2 text-xs" onClick={importPaste}>Importar filas</button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Documentos y capturas</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="rounded-xl border border-dashed p-3 text-sm">
            PDF original
            <input className="mt-2 block" type="file" onChange={(e) => uploadFile(e, 'pdf_original')} />
          </label>
          <label className="rounded-xl border border-dashed p-3 text-sm">
            Captura o imagen
            <input className="mt-2 block" type="file" accept="image/*" onChange={(e) => uploadFile(e, 'image')} />
          </label>
        </div>

        <div className="mt-4 space-y-2">
          {promotion.documents.map((doc) => (
            <a key={doc.id} href={doc.publicUrl} target="_blank" rel="noreferrer" className="block rounded-lg border p-2 text-sm hover:bg-[var(--bg-app)]">
              {doc.originalName || doc.publicUrl} - {doc.documentKind}
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Previsualizacion publica</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">{promotion.publicDescription || promotion.statusMessage}</p>
      </section>

      <button
        type="button"
        disabled={saving}
        className="rounded-xl bg-[var(--green-500)] px-5 py-3 font-semibold text-white disabled:opacity-50"
        onClick={savePromotion}
      >
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>
    </main>
  );
}
