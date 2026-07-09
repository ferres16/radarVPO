'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export function CreatePromotionForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    if (!title.trim()) {
      setError('El título de la promoción es obligatorio.');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await api.createBackofficePromotion({
        title: title.trim(),
        status: 'published_unreviewed',
      });
      setTitle('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la promoción');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nueva promoción manual"
          className="ds-control"
        />
        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={creating}
          className="rounded-2xl bg-[var(--green-700)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--green-900)] disabled:opacity-60"
        >
          {creating ? 'Creando...' : 'Crear promoción'}
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
