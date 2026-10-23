'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { PromotionCard } from '@/components/promotion-card';
import {
  filterPromotionsByMunicipality,
  uniqueMunicipalities,
} from '@/lib/public-promotions';
import type { Promotion } from '@/types';

export function PromotionsExplorer({ promotions }: { promotions: Promotion[] }) {
  const municipalities = useMemo(() => uniqueMunicipalities(promotions), [promotions]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const municipalityFromUrl = searchParams.get('municipio')?.trim() || 'all';
  const [municipality, setMunicipality] = useState(municipalityFromUrl);
  const [query, setQuery] = useState(searchParams.get('q')?.trim() || '');
  const [filterReady, setFilterReady] = useState(false);

  useEffect(() => {
    setFilterReady(true);
  }, []);

  useEffect(() => {
    setMunicipality(municipalityFromUrl);
  }, [municipalityFromUrl]);

  const visible = useMemo(() => {
    const byTown = filterPromotionsByMunicipality(promotions, municipality);
    const q = query.trim().toLowerCase();
    if (!q) return byTown;
    return byTown.filter((item) => {
      const haystack = [item.title, item.municipality, item.province, item.promoter]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [municipality, promotions, query]);

  function updateUrl(nextMunicipality: string, nextQuery: string) {
    const params = new URLSearchParams();
    if (nextMunicipality && nextMunicipality !== 'all') {
      params.set('municipio', nextMunicipality);
    }
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function clearFilters() {
    setMunicipality('all');
    setQuery('');
    router.replace(pathname, { scroll: false });
  }

  const filtersActive = municipality !== 'all' || query.trim().length > 0;

  return (
    <div>
      {filterReady ? (
        <div className="lp-filter-bar flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {municipalities.length > 1 ? (
            <div>
              <label htmlFor="promotion-municipality" className="lp-filter-bar__label">
                Municipio
              </label>
              <select
                id="promotion-municipality"
                value={municipality}
                onChange={(event) => {
                  const value = event.target.value;
                  setMunicipality(value);
                  updateUrl(value, query);
                }}
                className="lp-filter-bar__select"
              >
                <option value="all">Todos ({promotions.length})</option>
                {municipalities.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="min-w-[12rem] flex-1">
            <label htmlFor="promotion-search" className="lp-filter-bar__label">
              Buscar
            </label>
            <input
              id="promotion-search"
              type="search"
              value={query}
              onChange={(event) => {
                const value = event.target.value;
                setQuery(value);
                updateUrl(municipality, value);
              }}
              placeholder="Título, municipio o promotor"
              className="lp-filter-bar__select w-full"
            />
          </div>
          {filtersActive ? (
            <button type="button" className="btn btn--secondary" onClick={clearFilters}>
              Limpiar filtros
            </button>
          ) : null}
        </div>
      ) : null}

      {filterReady && filtersActive ? (
        <p className="mt-3 text-sm text-[var(--ink-soft)]" role="status">
          Mostrando {visible.length} de {promotions.length}
          {municipality !== 'all' ? ` · ${municipality}` : ''}
          {query.trim() ? ` · “${query.trim()}”` : ''}
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          No hay promociones con estos filtros. Prueba otro municipio o{' '}
          <button type="button" className="font-semibold text-[var(--green-700)] underline" onClick={clearFilters}>
            limpia la búsqueda
          </button>
          .
        </p>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((promotion) => (
            <PromotionCard key={promotion.id} promotion={promotion} layout="grid" animated={false} />
          ))}
        </div>
      )}
    </div>
  );
}
