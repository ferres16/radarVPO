'use client';

import { useMemo, useRef, useState } from 'react';
import { SurfaceCard, SectionHeader } from '@/components/design-system';
import {
  mergePromotionSections,
  parsePromotionStructuredJson,
  type PromotionFormPatch,
  type PromotionSectionRecords,
} from '@/lib/promotion-json-import';

const EXAMPLE_JSON = `{
  "fechas": {
    "inicio_procedimiento": "Día natural siguiente a la publicación del anuncio..."
  },
  "requisitos": {
    "registro": "Inscripción obligatoria en el Registro de Solicitantes..."
  },
  "economia": {
    "tipo": "Alquiler asequible en régimen general.",
    "renta_mensual_min": "328,18 €"
  },
  "cuotas_reservas": {
    "total_viviendas": 28
  },
  "contacto": {
    "promotor": "UTE SALAS...",
    "ubicacion": "Carrer Indústria, 4, Olesa de Montserrat"
  }
}`;

type PromotionJsonImporterProps = {
  sections: PromotionSectionRecords;
  onSectionsChange: (sections: PromotionSectionRecords) => void;
  formPatch: PromotionFormPatch;
  onFormPatch: (patch: PromotionFormPatch) => void;
};

export function PromotionJsonImporter({
  sections,
  onSectionsChange,
  formPatch,
  onFormPatch,
}: PromotionJsonImporterProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonBuffer, setJsonBuffer] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [feedback, setFeedback] = useState('');

  const preview = useMemo(() => {
    if (!jsonBuffer.trim()) return null;
    return parsePromotionStructuredJson(jsonBuffer);
  }, [jsonBuffer]);

  function applyImport() {
    const result = parsePromotionStructuredJson(jsonBuffer);
    if (result.errors.length > 0) {
      setFeedback(result.errors.join(' '));
      return;
    }

    onSectionsChange(mergePromotionSections(sections, result.sections, importMode));
    if (Object.keys(result.formPatch).length > 0) {
      onFormPatch({ ...formPatch, ...result.formPatch });
    }

    const applied = [
      ...result.summary,
      ...Object.entries(result.formPatch).map(([key, value]) => `Ficha: ${key} = ${value}`),
    ];
    setFeedback(`Importado: ${applied.join(' · ')}`);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setJsonBuffer(String(reader.result || ''));
      setFeedback(`Archivo cargado: ${file.name}`);
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  }

  return (
    <SurfaceCard className="p-5">
      <SectionHeader
        eyebrow="Importación automática"
        title="Rellenar bloques desde JSON"
        description="Pega o carga un JSON con fechas, requisitos, economía, cuotas_reservas y contacto. Se mapean a los campos estructurados de la ficha."
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold"
          onClick={() => setJsonBuffer(EXAMPLE_JSON)}
        >
          Cargar ejemplo
        </button>
        <button
          type="button"
          className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold"
          onClick={() => fileInputRef.current?.click()}
        >
          Subir archivo .json
        </button>
        <input ref={fileInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleFileChange} />
        <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--stroke)] bg-[var(--bg-app)] px-4 py-2 text-sm font-semibold">
          <select
            className="bg-transparent text-sm font-semibold outline-none"
            value={importMode}
            onChange={(event) => setImportMode(event.target.value as 'merge' | 'replace')}
          >
            <option value="merge">Combinar con lo existente</option>
            <option value="replace">Sustituir bloques importados</option>
          </select>
        </label>
      </div>

      <textarea
        className="ds-control mt-4 min-h-56 w-full font-mono text-xs"
        value={jsonBuffer}
        onChange={(event) => setJsonBuffer(event.target.value)}
        placeholder='Pega aquí el JSON con bloques "fechas", "requisitos", "economia", "cuotas_reservas" y "contacto".'
      />

      {preview && preview.summary.length > 0 ? (
        <p className="mt-3 text-sm text-[var(--ink-soft)]">Vista previa: {preview.summary.join(' · ')}</p>
      ) : null}

      {preview && preview.errors.length > 0 ? (
        <p className="mt-3 text-sm text-red-700">{preview.errors.join(' ')}</p>
      ) : null}

      {feedback ? <p className="mt-3 text-sm font-semibold text-[var(--green-700)]">{feedback}</p> : null}

      <button
        type="button"
        className="mt-4 rounded-xl bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--green-900)]"
        onClick={applyImport}
        disabled={!jsonBuffer.trim()}
      >
        Importar JSON a la ficha
      </button>
    </SurfaceCard>
  );
}
