'use client';

import { useEffect, useMemo, useState } from 'react';
import { PromotionCard } from '@/components/promotion-card';
import { uniqueMunicipalities } from '@/lib/public-promotions';
import type { Promotion } from '@/types';

export function PromotionsExplorer({ promotions }: { promotions: Promotion[] }) {
  const municipalities = useMemo(() => uniqueMunicipalities(promotions), [promotions]);
  const [municipality, setMunicipality] = useState('all');
  const [filterReady, setFilterReady] = useState(false);

  useEffect(() => {
    setFilterReady(true);
  }, []);

  const visible = useMemo(() => {
    if (municipality === 'all') return promotions;
    return promotions.filter((item) => item.municipality === municipality);
  }, [municipality, promotions]);

  return (
    <div>
      {filterReady && municipalities.length > 1 ? (
        <div className="lp-filter-bar">
          <label htmlFor="promotion-municipality" className="lp-filter-bar__label">
            Municipio
          </label>
          <select
            id="promotion-municipality"
            value={municipality}
            onChange={(event) => setMunicipality(event.target.value)}
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

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--ink-soft)]">No hay promociones publicadas en este municipio ahora mismo.</p>
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
