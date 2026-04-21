'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { BackofficeNewsItem } from '@/types';

type NewsFormState = {
  title: string;
  sourceName: string;
  sourceUrl: string;
  relevance: string;
  publishedAt: string;
  summary: string;
};

const initialForm: NewsFormState = {
  title: '',
  sourceName: 'Radar VPO',
  sourceUrl: 'https://radar-vpo-frontend-ten.vercel.app',
  relevance: 'medium',
  publishedAt: new Date().toISOString().slice(0, 16),
  summary: '',
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<BackofficeNewsItem[]>([]);
  const [form, setForm] = useState<NewsFormState>(initialForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const rows = await api.getBackofficeNews();
        if (!active) return;
        setItems(rows);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'No se pudo cargar noticias');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const created = await api.createBackofficeNews({
        title: form.title,
        sourceName: form.sourceName,
        sourceUrl: form.sourceUrl,
        relevance: form.relevance,
        publishedAt: new Date(form.publishedAt).toISOString(),
        summary: form.summary,
      });
      setItems((prev) => [created, ...prev]);
      setForm(initialForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la noticia');
    } finally {
      setCreating(false);
    }
  }

  async function onSave(item: BackofficeNewsItem) {
    setSavingId(item.id);
    setError('');
    try {
      const updated = await api.updateBackofficeNews(item.id, {
        title: item.title,
        summary: item.summary,
        relevance: item.relevance,
      });
      setItems((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la noticia');
    } finally {
      setSavingId('');
    }
  }

  async function onDelete(newsId: string) {
    setError('');
    try {
      await api.deleteBackofficeNews(newsId);
      setItems((prev) => prev.filter((row) => row.id !== newsId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la noticia');
    }
  }

  if (loading) {
    return (
      <main className="shell">
        <article className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
          <p className="text-sm text-[var(--ink-soft)]">Cargando noticias...</p>
        </article>
      </main>
    );
  }

  return (
    <main className="shell space-y-5">
      <header className="rounded-3xl border border-[var(--stroke)] bg-white p-6 shadow-card">
        <h1 className="text-2xl font-bold text-[var(--ink)]">Administrar noticias</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Crea, edita y elimina noticias publicadas en la web.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Nueva noticia</h2>
        <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={onCreate}>
          <input
            required
            placeholder="Titulo"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          />
          <input
            required
            placeholder="Fuente"
            value={form.sourceName}
            onChange={(e) => setForm((prev) => ({ ...prev, sourceName: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          />
          <input
            required
            placeholder="URL fuente"
            value={form.sourceUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, sourceUrl: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          />
          <input
            type="datetime-local"
            required
            value={form.publishedAt}
            onChange={(e) => setForm((prev) => ({ ...prev, publishedAt: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          />
          <select
            value={form.relevance}
            onChange={(e) => setForm((prev) => ({ ...prev, relevance: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          >
            <option value="high">high</option>
            <option value="medium">medium</option>
            <option value="low">low</option>
          </select>
          <input
            placeholder="Resumen"
            value={form.summary}
            onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
            className="rounded-xl border border-[var(--stroke)] px-3 py-2"
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
            >
              {creating ? 'Creando...' : 'Crear noticia'}
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <article className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </article>
      ) : null}

      <section className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-card">
            <div className="grid gap-3 md:grid-cols-3">
              <input
                value={item.title}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, title: e.target.value } : row,
                    ),
                  )
                }
                className="rounded-xl border border-[var(--stroke)] px-3 py-2 md:col-span-2"
              />
              <select
                value={item.relevance}
                onChange={(e) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === item.id ? { ...row, relevance: e.target.value } : row,
                    ),
                  )
                }
                className="rounded-xl border border-[var(--stroke)] px-3 py-2"
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>
            <textarea
              value={item.summary || ''}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((row) =>
                    row.id === item.id ? { ...row, summary: e.target.value } : row,
                  ),
                )
              }
              rows={3}
              className="mt-3 w-full rounded-xl border border-[var(--stroke)] px-3 py-2"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void onSave(item)}
                disabled={savingId === item.id}
                className="rounded-xl bg-[var(--green-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--green-700)] disabled:opacity-60"
              >
                {savingId === item.id ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={() => void onDelete(item.id)}
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
