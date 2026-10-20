import type { ProofItem } from '@/lib/catalog-stats';

export function ProofStats({ items }: { items: readonly ProofItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="lp-proof-stats">
      {items.map((item) => (
        <li key={`${item.value}-${item.label}`} className="lp-proof-stats__item">
          <span className="lp-proof-stats__value">{item.value}</span>
          <span className="lp-proof-stats__label">{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
