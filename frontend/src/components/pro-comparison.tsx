import { proComparisonRows, proHref, proPlan, type ProComparisonCell } from '@/lib/pro';
import { ButtonLink } from './design-system';

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

export function ProComparison({
  title = 'Gratis vs VPO PRO',
  description = 'La versión gratuita informa. PRO te avisa antes, te prepara y te da ventaja real.',
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

      <div className="compare-table-wrap">
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

      <div className="compare-block__cta">
        <ButtonLink href={proHref} size="lg">
          Empieza hoy por 7,99 €/mes
        </ButtonLink>
        <p className="compare-block__note">Cancela cuando quieras · Sin permanencia</p>
      </div>
    </section>
  );
}
