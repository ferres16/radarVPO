'use client';

import type { PreparedSmsPreview } from '@/types';

const SMS_BLOCK_REASONS: Record<string, string> = {
  sms_body_too_short: 'Texto demasiado corto: el SMS no se enviaría.',
  sms_missing_required_text: 'Falta la ubicación tras recortar: el SMS no se enviaría.',
  sms_too_long: 'Supera 2 segmentos: el SMS no se enviaría.',
};

export function smsBlockReasonLabel(reason?: string | null) {
  if (!reason) return '';
  return SMS_BLOCK_REASONS[reason] ?? reason;
}

export function SmsBubble({
  content,
  meta,
}: {
  content: string;
  meta?: Pick<PreparedSmsPreview, 'ok' | 'units' | 'segments' | 'truncated' | 'reason'> | null;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">SMS</p>
      <div
        className={`max-w-md whitespace-pre-wrap break-words rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-6 ${
          meta && !meta.ok ? 'bg-red-50 text-red-900 ring-1 ring-red-200' : 'bg-[var(--bg-app)] text-[var(--ink)]'
        }`}
      >
        {content || '—'}
      </div>
      {meta ? (
        <p className="text-xs text-[var(--ink-soft)]">
          {meta.units} caracteres · {meta.segments} {meta.segments === 1 ? 'segmento' : 'segmentos'} · GSM-7
          {meta.truncated ? ' · recortado' : ''}
          {!meta.ok ? (
            <span className="ml-1 font-semibold text-red-700">{smsBlockReasonLabel(meta.reason)}</span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export function EmailPreview({ subject, html }: { subject: string; html: string }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Email</p>
      <p className="text-sm">
        <span className="text-[var(--ink-soft)]">Asunto: </span>
        <strong className="text-[var(--ink)]">{subject || '—'}</strong>
      </p>
      <iframe
        title={`Vista previa: ${subject}`}
        sandbox=""
        srcDoc={html}
        className="h-80 w-full rounded-xl border border-[var(--stroke)] bg-white"
      />
    </div>
  );
}
