'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Modo lectura a pantalla completa (CSS fixed).
 * Más fiable en móvil que la Fullscreen API (iOS no la soporta bien en divs).
 */
export function usePdfFullscreen() {
  const [fullscreen, setFullscreen] = useState(false);

  const enter = useCallback(() => setFullscreen(true), []);
  const exit = useCallback(() => setFullscreen(false), []);
  const toggle = useCallback(() => setFullscreen((value) => !value), []);

  useEffect(() => {
    if (!fullscreen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fullscreen]);

  return { fullscreen, enter, exit, toggle };
}
