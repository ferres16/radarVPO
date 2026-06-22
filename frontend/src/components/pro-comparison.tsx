import { proComparisonRows, proHref, proPlan } from '@/lib/pro';
import { ButtonLink, SectionHeader, SurfaceCard } from './design-system';

function CheckIcon({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
        active ? 'bg-[rgba(22,112,85,0.12)] text-[var(--green-700)]' : 'bg-[var(--bg-muted)] text-[var(--ink-soft)]'
      }`}
      aria-hidden="true"
    >
      {active ? '✓' : '—'}
    </span>
  );
}

export function ProComparison({
  title = 'Gratis vs VPO PRO',
  description = 'La web te informa. VPO PRO te avisa antes y te prepara para actuar.',
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <section className={compact ? 'space-y-4' : 'space-y-5'}>
      {compact && title ? (
        <h2 className="display-type text-xl font-black text-[var(--ink)] md:text-2xl">{title}</h2>
      ) : null}
      {!compact ? <SectionHeader title={title} description={description} /> : null}
      <SurfaceCard premium className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--stroke)] bg-[var(--bg-app)]/80">
                <th className="p-4 text-left font-bold text-[var(--ink)]">Qué incluye</th>
                <th className="p-4 text-center font-bold text-[var(--ink-soft)]">Gratis</th>
                <th className="p-4 text-center font-bold text-[var(--green-700)]">{proPlan.name}</th>
              </tr>
            </thead>
            <tbody>
              {proComparisonRows.map((row) => (
                <tr key={row.feature} className="border-b border-[var(--stroke)] last:border-b-0">
                  <td className="p-4 font-medium text-[var(--ink)]">{row.feature}</td>
                  <td className="p-4 text-center">
                    <CheckIcon active={row.free} />
                    <span className="sr-only">{row.free ? 'Incluido' : 'No incluido'}</span>
                  </td>
                  <td className="bg-[rgba(22,112,85,0.04)] p-4 text-center">
                    <CheckIcon active={row.pro} />
                    <span className="sr-only">{row.pro ? 'Incluido' : 'No incluido'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center gap-2 border-t border-[var(--stroke)] bg-[var(--bg-eco)]/40 p-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm font-semibold text-[var(--ink)]">
            {proPlan.price} · ventaja real cuando abre un plazo
          </p>
          <ButtonLink href={proHref}>{proPlan.ctaLabel}</ButtonLink>
        </div>
      </SurfaceCard>
    </section>
  );
}
