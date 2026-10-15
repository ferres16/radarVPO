'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { trackEvent } from '@/lib/analytics';

type State = 'loading' | 'anonymous' | 'idle' | 'saved' | 'busy';

/** Guarda o quita una promoción de "Mi espacio". */
export function SavePromotionButton({ promotionId }: { promotionId: string }) {
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getFavorites()
      .then((favorites) => {
        if (cancelled) return;
        setState(favorites.some((item) => item.promotion.id === promotionId) ? 'saved' : 'idle');
      })
      .catch(() => {
        if (!cancelled) setState('anonymous');
      });
    return () => {
      cancelled = true;
    };
  }, [promotionId]);

  const buttonClass =
    'inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--stroke)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] outline-none transition hover:bg-[var(--bg-eco)] focus-visible:ring-2 focus-visible:ring-[var(--green-700)] disabled:opacity-60';

  if (state === 'anonymous') {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/promotions/${promotionId}`)}`}
        className={buttonClass}
      >
        Guardar en Mi espacio
      </Link>
    );
  }

  const toggle = async () => {
    const wasSaved = state === 'saved';
    setState('busy');
    setMessage(null);
    try {
      const result = await api.toggleFavorite(promotionId);
      setState(result.favorite ? 'saved' : 'idle');
      trackEvent(result.favorite ? 'favorite_saved' : 'favorite_removed', { promotionId });
    } catch (error) {
      setState(wasSaved ? 'saved' : 'idle');
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className={buttonClass}
        onClick={toggle}
        disabled={state === 'loading' || state === 'busy'}
        aria-pressed={state === 'saved'}
      >
        {state === 'saved' ? 'Guardada en Mi espacio ✓' : 'Guardar en Mi espacio'}
      </button>
      {state === 'saved' ? (
        <Link href="/mi-espacio" className="text-sm font-semibold text-[var(--green-700)] underline">
          Ir a Mi espacio
        </Link>
      ) : null}
      {message ? (
        <p role="alert" className="max-w-sm text-sm text-[var(--ink-soft)]">
          {message}{' '}
          {message.includes('PRO') ? (
            <Link href="/pro" className="font-semibold text-[var(--green-700)] underline">
              Ver PRO
            </Link>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
