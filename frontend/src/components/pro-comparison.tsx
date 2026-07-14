'use client';

import { proComparisonRows, proPlan, freeVsProDescription, type ProComparisonCell } from '@/lib/pro';
import { ProCta, ProGate } from '@/components/pro/pro-cta';

function ComparisonCell({ value, highlight = false }: { value: ProComparisonCell; highlight?: boolean }) {
  if (typeof value === 'string') {
    return (
      <span className={`compare-table__text ${highlight ? 'compare-table__text--pro' : ''}`}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={`compare-table__icon ${value ? 'compare-table__icon--yes' : 'compare-table__icon--no'}`}
      aria-label={value ? 'Incluido' : 'No incluido'}
    >
      {value ? '✓' : '—'}
    </span>
  );
}

function cellLabel(value: ProComparisonCell) {
  if (typeof value === 'string') return value;
  return value ? 'Incluido' : 'No incluido';
}

export function ProComparison({
  title = 'Gratis vs VPO PRO',
  description = freeVsProDescription,
  compact = false,
  showHeader = true,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  showHeader?: boolean;
}) {
  return (
    <section className={compact ? 'compare-block compare-block--compact' : 'compare-block'} aria-labelledby="compare-title">
      {showHeader ? (
        <div className="lp-section__head">
          {!compact ? <p className="lp-eyebrow">Comparativa</p> : null}
          <h2 id="compare-title" className={compact ? 'lp-title lp-title--sm' : 'lp-title'}>
            {title}
          </h2>
          {!compact && description ? <p className="lp-lead">{description}</p> : null}
        </div>
      ) : null}

      <div className="compare-mobile" aria-label="Comparativa móvil Free vs PRO">
        {proComparisonRows.map((row) => (
          <article key={row.feature} className="compare-mobile__card">
            <p className="compare-mobile__feature">{row.feature}</p>
            <div className="compare-mobile__row">
              <div className="compare-mobile__plan">
                <p className="text-[10px] uppercase tracking-wide text-[var(--ink-soft)]">Free</p>
                <p className="mt-1">{cellLabel(row.free)}</p>
              </div>
              <div className="compare-mobile__plan compare-mobile__plan--pro">
                <p className="text-[10px] uppercase tracking-wide">PRO</p>
                <p className="mt-1 font-semibold">{cellLabel(row.pro)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="compare-table-wrap compare-table-wrap--desktop">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">Función</th>
              <th scope="col">Free</th>
              <th scope="col" className="compare-table__pro-col">
                {proPlan.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {proComparisonRows.map((row) => (
              <tr key={row.feature}>
                <th scope="row">{row.feature}</th>
                <td>
                  <ComparisonCell value={row.free} />
                </td>
                <td className="compare-table__pro-col">
                  <ComparisonCell value={row.pro} highlight />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProGate>
        <div className="compare-block__cta">
          <ProCta size="lg" className="btn--block sm:!w-auto" label={`${proPlan.ctaLabel} · ${proPlan.price}`} />
          <p className="compare-block__note">Cancela cuando quieras · Sin permanencia</p>
        </div>
      </ProGate>
    </section>
  );
}
