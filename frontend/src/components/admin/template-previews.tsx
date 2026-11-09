'use client';

import { useEffect, useState } from 'react';
import { EmailPreview, SmsBubble } from '@/components/admin/message-preview';
import { api } from '@/lib/api';
import type { MessageTemplatePreview } from '@/types';

/** Todas las plantillas renderizadas por el backend, tal cual saldrían (con datos de ejemplo). */
export function TemplatePreviews({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<MessageTemplatePreview[] | null>(null);
  const [error, setError] = useState('');
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api
      .getBackofficeMessageTemplatePreviews()
      .then((result) => {
        if (!active) return;
        setError('');
        setRows(result);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar la vista previa.');
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <section id="vista-previa" className="space-y-3 rounded-2xl border border-[var(--stroke)] bg-white p-4 md:p-5">
      <div>
        <h2 className="text-lg font-bold text-[var(--ink)]">Vista previa de todos los mensajes</h2>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Generada por el mismo código que envía: asunto y HTML final del email y el SMS exacto (sin tildes,
          con recuento de caracteres). Si un SMS sale en rojo, no se enviaría.
        </p>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {!rows && !error ? <p className="text-sm text-[var(--ink-soft)]">Cargando…</p> : null}
      <ul className="divide-y divide-[var(--stroke)]">
        {rows?.map((row) => {
          const open = openKey === row.key;
          const smsBlocked = row.sms && !row.sms.ok;
          return (
            <li key={row.key} className="py-3">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setOpenKey(open ? null : row.key)}
                className="flex w-full flex-wrap items-center justify-between gap-2 text-left"
              >
                <span>
                  <span className="block text-sm font-semibold text-[var(--ink)]">{row.label}</span>
                  <span className="block text-xs text-[var(--ink-soft)]">
                    <code>{row.key}</code>
                    {row.active ? '' : ' · desactivada'}
                    {row.isCustomized ? ' · personalizada' : ''}
                  </span>
                </span>
                <span className="flex flex-wrap gap-1 text-[11px] font-bold uppercase tracking-wide">
                  {row.email ? (
                    <span className="rounded-full bg-[var(--bg-app)] px-2 py-0.5 text-[var(--ink)]">Email</span>
                  ) : null}
                  {row.sms ? (
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        smsBlocked ? 'bg-red-100 text-red-800' : 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]'
                      }`}
                    >
                      SMS {row.sms.units}c
                    </span>
                  ) : null}
                </span>
              </button>
              {open ? (
                <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                  {row.sms ? (
                    <div className="space-y-1">
                      <SmsBubble content={row.sms.content} meta={row.sms} />
                      {!row.smsSentForThisTemplate ? (
                        <p className="text-xs text-[var(--ink-soft)]">Este tipo de aviso no envía SMS.</p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="text-sm text-[var(--ink-soft)]">Sin SMS.</p>
                  )}
                  {row.email ? <EmailPreview subject={row.email.subject} html={row.email.html} /> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
