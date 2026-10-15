'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PublicPage, PublicPageHero, PublicSection } from '@/components/conversion/public-shell';
import { ButtonLink } from '@/components/design-system';
import { SavedPromotionItem } from '@/components/my-space/saved-promotion-item';
import { useProAccess } from '@/components/pro-access-provider';
import { api } from '@/lib/api';
import { FREE_SAVED_PROMOTIONS_LIMIT, sortSavedByStage } from '@/lib/my-space';
import type { SavedPromotion } from '@/types';

export default function MySpacePage() {
  const { me, loading, hasPro } = useProAccess();
  const [items, setItems] = useState<SavedPromotion[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!me) return;
    let active = true;
    api
      .getFavorites()
      .then((list) => {
        if (active) setItems(list);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'No se pudo cargar Mi espacio.');
      });
    return () => {
      active = false;
    };
  }, [me]);

  const sorted = useMemo(() => (items ? sortSavedByStage(items) : []), [items]);

  return (
    <PublicPage>
      <PublicPageHero
        badge="Mi espacio"
        title="Tus oportunidades,"
        titleAccent="en un solo lugar"
        description="Guarda las promociones que te interesan, apunta tus notas y marca los pasos que llevas hechos. Solo tú ves esta información."
        animated={false}
      />
      <PublicSection animated={false}>
        {loading ? (
          <p className="text-sm text-[var(--ink-soft)]">Cargando…</p>
        ) : !me ? (
          <div className="public-card mx-auto max-w-md p-6 text-center">
            <p className="font-semibold text-[var(--ink)]">Inicia sesión para usar Mi espacio.</p>
            <div className="mt-4 space-y-2">
              <ButtonLink href="/login?next=/mi-espacio" size="lg" block>
                Entrar
              </ButtonLink>
              <ButtonLink href="/register?next=/mi-espacio" variant="secondary" size="lg" block>
                Crear cuenta gratis
              </ButtonLink>
            </div>
          </div>
        ) : error ? (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : items === null ? (
          <p className="text-sm text-[var(--ink-soft)]">Cargando tus promociones…</p>
        ) : (
          <div className="space-y-4">
            {!hasPro ? (
              <p className="rounded-xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm text-[var(--ink-soft)]">
                Con tu cuenta gratuita puedes guardar hasta {FREE_SAVED_PROMOTIONS_LIMIT} promociones (llevas{' '}
                {items.length}).{' '}
                <Link href="/pro" className="font-semibold text-[var(--green-700)] underline">
                  Radar VPO PRO
                </Link>{' '}
                quita ese límite.
              </p>
            ) : null}

            {sorted.length === 0 ? (
              <div className="public-card mx-auto max-w-md p-6 text-center">
                <p className="font-semibold text-[var(--ink)]">Todavía no has guardado ninguna promoción.</p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  Abre una promoción y pulsa «Guardar en Mi espacio».
                </p>
                <div className="mt-4">
                  <ButtonLink href="/promotions" size="lg" block>
                    Ver promociones
                  </ButtonLink>
                </div>
              </div>
            ) : (
              sorted.map((item) => (
                <SavedPromotionItem
                  key={item.id}
                  item={item}
                  onRemoved={(promotionId) =>
                    setItems((current) => (current ? current.filter((entry) => entry.promotion.id !== promotionId) : current))
                  }
                />
              ))
            )}
          </div>
        )}
      </PublicSection>
    </PublicPage>
  );
}
