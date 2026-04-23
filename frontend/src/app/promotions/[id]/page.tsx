import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

function printJson(value: unknown) {
  if (!value) return 'n/d';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return 'n/d';
  }
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
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Fechas</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
              {printJson(promotion.importantDates)}
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Requisitos</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
              {printJson(promotion.requirements)}
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Economia</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
              {printJson(promotion.economicInfo)}
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Contacto</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
              {printJson(promotion.contactInfo)}
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4 md:col-span-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Cuotas y reservas</h2>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-[var(--ink)]">
              {printJson(promotion.feesAndReservations)}
            </pre>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--green-700)]">Tabla de viviendas</h2>
          {promotion.units.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--ink-soft)]">Pendiente de revision manual.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--stroke)]">
                    <th className="p-2 text-left">Escalera</th>
                    <th className="p-2 text-left">Planta</th>
                    <th className="p-2 text-left">Puerta</th>
                    <th className="p-2 text-left">Entrada/Comedor</th>
                    <th className="p-2 text-left">Habitaciones</th>
                    <th className="p-2 text-left">Cocina</th>
                    <th className="p-2 text-left">Baños (E/S/C)</th>
                    <th className="p-2 text-left">Otras piezas</th>
                    <th className="p-2 text-left">Ocup. max.</th>
                    <th className="p-2 text-left">Sup. útil</th>
                    <th className="p-2 text-left">Sup. comp.</th>
                    <th className="p-2 text-left">Reserva</th>
                    <th className="p-2 text-left">P.V. max.</th>
                  </tr>
                </thead>
                <tbody>
                  {promotion.units.map((row) => (
                    <tr key={row.id} className="border-b border-[var(--stroke)]">
                      <td className="p-2">{row.stair || 'n/d'}</td>
                      <td className="p-2">{row.floor || 'n/d'}</td>
                      <td className="p-2">{row.door || 'n/d'}</td>
                      <td className="p-2">{String(row.extraData?.entradaComedor || 'n/d')}</td>
                      <td className="p-2">{row.bedrooms ?? 'n/d'}</td>
                      <td className="p-2">{String(row.extraData?.cocina || 'n/d')}</td>
                      <td className="p-2">{String(row.extraData?.banosEntradaSalonCocina || row.bathrooms || 'n/d')}</td>
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
