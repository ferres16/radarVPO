import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

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

function prettyLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
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
      className={`rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 ${wide ? 'md:col-span-2' : ''}`}
    >
      <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">{title}</h2>

      {!isMap || entries.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--ink-soft)]">Sin datos disponibles.</p>
      ) : (
        <dl className="mt-3 space-y-2">
          {entries.map(([key, value]) => {
            const printable = stringifyValue(value);
            const formattedKey = prettyLabel(key);
            const isComplex = typeof value === 'object' && value !== null;

            return (
              <div
                key={key}
                className="rounded-xl border border-[var(--stroke)] bg-white/80 px-3 py-2"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-[var(--green-700)]">
                  {formattedKey}
                </dt>
                {isComplex ? (
                  <dd className="mt-1 overflow-x-auto rounded-lg bg-[var(--bg-app)] p-2 font-mono text-xs text-[var(--ink)]">
                    <pre className="whitespace-pre-wrap">{printable}</pre>
                  </dd>
                ) : (
                  <dd className="mt-1 text-sm text-[var(--ink)]">{printable}</dd>
                )}
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

export default async function PromotionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await api.getPromotionById(id).catch(() => null);

  if (!promotion) {
    return notFound();
  }

  return (
    <main className="shell pb-10">
      <article className="rounded-[1.75rem] border border-[var(--stroke)] bg-white p-6 shadow-card animate-fade-up">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--ink)] md:text-3xl">{promotion.title}</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          {promotion.municipality || 'Catalunya'}
          {promotion.province ? `, ${promotion.province}` : ''}
        </p>

        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(78,143,58,0.08),rgba(255,255,255,0.92))] p-4 text-sm">
          <p className="font-semibold text-[var(--ink)]">Estado: {promotion.status}</p>
          <p className="mt-1 text-[var(--ink-soft)]">
            {promotion.statusMessage ||
              'Estamos analizando esta promocion y actualizando la informacion'}
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 transition hover:-translate-y-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Informacion general</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">Tipo: {promotion.promotionType}</p>
            <p className="text-sm text-[var(--ink)]">Promotor: {promotion.promoter || 'n/d'}</p>
            <p className="text-sm text-[var(--ink)]">Total viviendas: {promotion.totalHomes ?? 'n/d'}</p>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 transition hover:-translate-y-0.5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Descripcion</h2>
            <p className="mt-2 text-sm text-[var(--ink)]">
              {promotion.publicDescription ||
                'Estamos completando esta ficha para ofrecerte la información más útil posible.'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <DataBlock title="Fechas" payload={promotion.importantDates} />
          <DataBlock title="Requisitos" payload={promotion.requirements} />
          <DataBlock title="Economia" payload={promotion.economicInfo} />
          <DataBlock title="Contacto" payload={promotion.contactInfo} />
          <DataBlock title="Cuotas y reservas" payload={promotion.feesAndReservations} wide />
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Tabla de viviendas</h2>
          {promotion.units.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Pendiente de revision manual.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[1500px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--stroke)]">
                    <th className="p-2 text-left">Ord.</th>
                    <th className="p-2 text-left">Règ. us</th>
                    <th className="p-2 text-left">Tip.</th>
                    <th className="p-2 text-left">Escalera</th>
                    <th className="p-2 text-left">Planta</th>
                    <th className="p-2 text-left">Puerta</th>
                    <th className="p-2 text-left">E-M</th>
                    <th className="p-2 text-left">6sH &lt; 8</th>
                    <th className="p-2 text-left">8sH &lt; 12</th>
                    <th className="p-2 text-left">H &gt; 12</th>
                    <th className="p-2 text-left">C</th>
                    <th className="p-2 text-left">CH</th>
                    <th className="p-2 text-left">E-M-C</th>
                    <th className="p-2 text-left">Otras piezas</th>
                    <th className="p-2 text-left">Ocup. max.</th>
                    <th className="p-2 text-left">Sup. útil interior</th>
                    <th className="p-2 text-left">Sup. comp.</th>
                    <th className="p-2 text-left">Res</th>
                    <th className="p-2 text-left">P.V. max.</th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.units.map((row, index) => (
                    <tr key={row.id} className="border-b border-[var(--stroke)]">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2">{String(row.extraData?.regUs || row.extraData?.regimenUso || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.tip || row.extraData?.tipologia || 'n/d')}</td>
                      <td className="p-2">{row.stair || 'n/d'}</td>
                      <td className="p-2">{row.floor || 'n/d'}</td>
                      <td className="p-2">{row.door || 'n/d'}</td>
                      <td className="p-2">{String(row.extraData?.em || row.extraData?.entradaComedor || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.h6sh8 || row.extraData?.h6sHlt8 || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.h8sh12 || row.extraData?.h8sHlt12 || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.hgt12 || row.extraData?.hGt12 || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.c || row.extraData?.cocina || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.ch || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.emc || row.extraData?.banosEntradaSalonCocina || row.bathrooms || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.otrasPiezas || row.notes || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.ocupacionMaxima || 'n/d')}</td>
                      <td className="p-2">{row.usefulAreaM2 ?? 'n/d'}</td>
                      <td className="p-2">{row.builtAreaM2 ?? 'n/d'}</td>
                      <td className="p-2">{row.reservation ?? 'n/d'}</td>
                      <td className="p-2">{row.priceSale ?? 'n/d'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Documentos de referencia</h2>
          {promotion.documents.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Sin documentos adjuntos.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {promotion.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white shadow-card transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--green-700)]"
                >
                  Ver PDF
                </a>
              ))}
            </div>
          )}
        </div>
      </article>
    </main>
  );
}
