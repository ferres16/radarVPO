'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminNav } from '@/components/admin-nav';
import { api } from '@/lib/api';
import type { MessageTemplate, UserProfile } from '@/types';

function previewHtml(body: string | null) {
  if (!body) return '<p class="text-[var(--ink-soft)]">(sin cuerpo)</p>';
  const sample: Record<string, string> = {
    name: 'Ana',
    email: 'ana@ejemplo.com',
    title: 'ALERTA: Propera adjudicació…',
    location: 'Santa Susanna, Barcelona',
    date: '15 de noviembre de 2026',
    url: 'https://www.radarvpo.com/alerts',
    product: 'Guía VPO inicial',
    price: '14,99 €',
    phone: '',
    access_until: '20 de enero de 2027',
    billing_summary: 'Importe: 9,99 € al mes. Se renueva automáticamente cada mes hasta que canceles.',
  };
  return body
    .replace(/Hola\s*\{\{\s*name\s*\}\}\s*,?/gi, 'Hola Ana,')
    .replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => sample[key] ?? `«${key}»`);
}

export default function AdminMessageTemplatesPage() {
  const [me, setMe] = useState<UserProfile | null>(null);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState('');
  const [draft, setDraft] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const profile = await api.getMe();
        if (!active) return;
        setMe(profile);
        if (profile.role !== 'admin') {
          setError('No tienes permisos de administrador.');
          return;
        }
        const rows = await api.getBackofficeMessageTemplates();
        if (!active) return;
        setTemplates(rows);
        if (rows[0]) {
          setSelectedKey(rows[0].key);
          setDraft(rows[0]);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar las plantillas.');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const emailPreview = useMemo(() => previewHtml(draft?.emailBody ?? null), [draft?.emailBody]);
  const subjectPreview = useMemo(
    () => previewHtml(draft?.emailSubject ?? null).replace(/<[^>]+>/g, ''),
    [draft?.emailSubject],
  );

  function selectTemplate(key: string) {
    const row = templates.find((item) => item.key === key);
    setSelectedKey(key);
    setDraft(row || null);
    setMessage('');
    setError('');
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.updateBackofficeMessageTemplate(draft.key, {
        label: draft.label,
        description: draft.description,
        channel: draft.channel,
        emailSubject: draft.emailSubject,
        emailBody: draft.emailBody,
        smsBody: draft.smsBody,
        active: draft.active,
      });
      setTemplates((prev) => prev.map((item) => (item.key === updated.key ? updated : item)));
      setDraft(updated);
      setMessage('Plantilla guardada. Los próximos envíos usarán este texto.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    if (!draft) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await api.resetBackofficeMessageTemplate(draft.key);
      setTemplates((prev) => prev.map((item) => (item.key === updated.key ? updated : item)));
      setDraft(updated);
      setMessage('Restaurada la plantilla por defecto del código (revisión de seeds).');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restaurar.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminNav />
        <main className="admin-main">
          <p className="text-sm text-[var(--ink-soft)]">Cargando plantillas…</p>
        </main>
      </div>
    );
  }

  if (!me || me.role !== 'admin') {
    return (
      <div className="admin-shell">
        <AdminNav />
        <main className="admin-main">
          <p className="text-sm font-semibold text-red-700">{error || 'Acceso denegado.'}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <main className="admin-main space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--ink-soft)]">Backoffice</p>
          <h1 className="display-type mt-1 text-3xl font-black text-[var(--ink)]">Emails / SMS</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
            Variables: {'{{name}}'}, {'{{location}}'}, {'{{date}}'}, {'{{url}}'}, {'{{product}}'},{' '}
            {'{{price}}'}, {'{{access_until}}'}, {'{{billing_summary}}'}. Si no personalizas, al
            desplegar se refrescan desde el código.
          </p>
        </header>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
        ) : null}
        {message ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
            {message}
          </p>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[260px_1fr_320px]">
          <aside className="space-y-1 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-3">
            {templates.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => selectTemplate(item.key)}
                className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  selectedKey === item.key
                    ? 'bg-[var(--bg-eco)] font-bold text-[var(--green-700)]'
                    : 'text-[var(--ink)] hover:bg-white'
                }`}
              >
                <span className="block">{item.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-[var(--ink-soft)]">
                  {item.key}
                  {!item.active ? ' · pausada' : ''}
                  {item.isCustomized ? ' · editada' : ''}
                </span>
              </button>
            ))}
          </aside>

          {draft ? (
            <section className="space-y-4 rounded-2xl border border-[var(--stroke)] bg-[var(--bg-app)] p-5">
              <p className="text-xs text-[var(--ink-soft)]">{draft.description}</p>

              <label className="flex items-center gap-2 text-sm text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Activa
              </label>

              <label className="block text-sm font-semibold text-[var(--ink)]">
                Asunto email
                <input
                  className="ds-control mt-1 w-full"
                  value={draft.emailSubject || ''}
                  onChange={(e) => setDraft({ ...draft, emailSubject: e.target.value })}
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--ink)]">
                Cuerpo email (HTML o texto)
                <textarea
                  className="ds-control mt-1 min-h-40 w-full font-mono text-xs"
                  value={draft.emailBody || ''}
                  onChange={(e) => setDraft({ ...draft, emailBody: e.target.value })}
                />
              </label>

              <label className="block text-sm font-semibold text-[var(--ink)]">
                SMS
                <textarea
                  className="ds-control mt-1 min-h-20 w-full font-mono text-xs"
                  value={draft.smsBody || ''}
                  onChange={(e) => setDraft({ ...draft, smsBody: e.target.value })}
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={saving}
                  onClick={() => void save()}
                >
                  {saving ? 'Guardando…' : 'Guardar plantilla'}
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={saving}
                  onClick={() => void resetToDefault()}
                >
                  Restaurar default
                </button>
              </div>
            </section>
          ) : null}

          {draft ? (
            <section className="rounded-2xl border border-[var(--stroke)] bg-[#e8ebe9] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Vista móvil
              </p>
              <div className="mx-auto mt-3 w-full max-w-[280px] overflow-hidden rounded-[28px] border-[8px] border-[#1f2937] bg-white shadow-sm">
                <div className="border-b border-[var(--stroke)] px-3 py-2">
                  <p className="truncate text-[11px] font-semibold text-[var(--ink)]">{subjectPreview}</p>
                  <p className="text-[10px] text-[var(--ink-soft)]">Radar VPO</p>
                </div>
                <div
                  className="max-h-[420px] overflow-y-auto px-3 py-3 text-[12px] leading-5 text-[var(--ink)] [&_a]:font-bold [&_a]:text-[var(--green-700)]"
                  dangerouslySetInnerHTML={{ __html: emailPreview }}
                />
              </div>
              {draft.smsBody ? (
                <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] leading-5 text-[var(--ink)]">
                  SMS: {previewHtml(draft.smsBody).replace(/<[^>]+>/g, '')}
                </p>
              ) : null}
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
