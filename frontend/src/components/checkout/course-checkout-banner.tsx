'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 2500;

/**
 * Tras pagar un curso, Stripe avisa a nuestro backend por webhook. Aquí esperamos
 * unos segundos a que el acceso quede activo y recargamos la página del curso.
 */
export function CourseCheckoutBanner({ slug }: { slug: string }) {
  const [visible, setVisible] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return;
    setVisible(true);

    let active = true;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      try {
        const course = await api.getCourseForUser(slug);
        if (!active) return;
        if (course.access?.canAccess) {
          window.location.replace(`/cursos/${slug}`);
          return;
        }
      } catch {
        // Seguimos intentando unos segundos.
      }
      if (!active) return;
      if (attempts >= POLL_ATTEMPTS) {
        setTimedOut(true);
        return;
      }
      window.setTimeout(() => void check(), POLL_INTERVAL_MS);
    };

    void check();
    return () => {
      active = false;
    };
  }, [slug]);

  if (!visible) return null;

  return (
    <div className="shell pt-4" role="status">
      <p className="rounded-2xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)]">
        {timedOut
          ? 'Hemos recibido el pago, pero la activación está tardando más de lo normal. Recarga la página en unos minutos; si no se activa, escribe a soporte con el correo de tu cuenta.'
          : 'Pago recibido. Estamos activando tu curso…'}
      </p>
    </div>
  );
}
