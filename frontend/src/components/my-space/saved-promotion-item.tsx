'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';
import { CHECKLIST_ITEMS, STAGES, checklistProgress, toggleChecklistItem } from '@/lib/my-space';
import type { FavoriteStage, SavedPromotion } from '@/types';

const dateFormatter = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long' });

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

export function SavedPromotionItem({
  item,
  onRemoved,
}: {
  item: SavedPromotion;
  onRemoved: (promotionId: string) => void;
}) {
  const { promotion } = item;
  const [stage, setStage] = useState<FavoriteStage>(item.stage);
  const [checklist, setChecklist] = useState<string[]>(item.checklistDone);
  const [notes, setNotes] = useState(item.notes ?? '');
  const [savedNotes, setSavedNotes] = useState(item.notes ?? '');
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const saveSeq = useRef(0);

  const isPublished = promotion.status === 'published_reviewed' || promotion.status === 'published_unreviewed';
  const progress = checklistProgress(checklist);
  const publishedAt = formatDate(promotion.publishedAt);
  const estimated = !isPublished ? formatDate(promotion.estimatedPublicationDate) : null;
  const place = [promotion.municipality, promotion.province].filter(Boolean).join(', ') || promotion.location;

  async function persist(payload: Parameters<typeof api.updateFavorite>[1], rollback: () => void) {
    const seq = ++saveSeq.current;
    setError('');
    try {
      await api.updateFavorite(promotion.id, payload);
    } catch (err) {
      if (seq === saveSeq.current) {
        rollback();
        setError(err instanceof Error ? err.message : 'No se pudo guardar el cambio.');
      }
    }
  }

  function changeStage(next: FavoriteStage) {
    const previous = stage;
    setStage(next);
    void persist({ stage: next }, () => setStage(previous));
  }

  function toggleItem(id: string) {
    const previous = checklist;
    const next = toggleChecklistItem(previous, id);
    setChecklist(next);
    void persist({ checklistDone: next }, () => setChecklist(previous));
  }

  function saveNotes() {
    if (notes === savedNotes) return;
    const previous = savedNotes;
    setSavedNotes(notes);
    void persist({ notes }, () => {
      setSavedNotes(previous);
      setNotes(previous);
    });
  }

  async function remove() {
    setRemoving(true);
    setError('');
    try {
      await api.toggleFavorite(promotion.id);
      trackEvent('favorite_removed', { promotionId: promotion.id });
      onRemoved(promotion.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo quitar la promoción.');
      setRemoving(false);
    }
  }

  return (
    <article className="public-card p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug text-[var(--ink)] md:text-lg">{promotion.title}</h3>
          {place ? <p className="mt-1 text-sm text-[var(--ink-soft)]">{place}</p> : null}
          <p className="mt-1 text-xs text-[var(--ink-soft)]">
            {isPublished
              ? publishedAt
                ? `Publicada el ${publishedAt}`
                : 'Promoción publicada'
              : estimated
                ? `Próximo lanzamiento · fecha estimada (no confirmada): ${estimated}`
                : 'Próximo lanzamiento · sin fecha confirmada'}
          </p>
        </div>
        <label className="text-xs font-semibold text-[var(--ink-soft)]">
          Estado
          <select
            value={stage}
            onChange={(event) => changeStage(event.target.value as FavoriteStage)}
            className="ds-control mt-1 block w-full min-w-[11rem]"
          >
            {STAGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-soft)]">
          <span>Mis pasos</span>
          <span>
            {progress.done} de {progress.total}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--bg-app)]">
          <div className="h-full rounded-full bg-[var(--green-500)] transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {CHECKLIST_ITEMS.map((step) => (
            <li key={step.id}>
              <label className="flex items-start gap-2 text-sm leading-6 text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={checklist.includes(step.id)}
                  onChange={() => toggleItem(step.id)}
                  className="mt-1.5 h-4 w-4 shrink-0"
                />
                <span>{step.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-4 block text-xs font-semibold text-[var(--ink-soft)]">
        Mis notas (solo las ves tú)
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          onBlur={saveNotes}
          maxLength={2000}
          rows={3}
          className="ds-control mt-1 block w-full text-sm"
        />
      </label>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {isPublished ? (
          <Link href={`/promotions/${promotion.id}`} className="btn btn--primary btn--sm">
            Ver PDF de la promoción
          </Link>
        ) : null}
        <button type="button" onClick={() => void remove()} disabled={removing} className="btn btn--secondary btn--sm">
          {removing ? 'Quitando…' : 'Quitar de Mi espacio'}
        </button>
      </div>
    </article>
  );
}
