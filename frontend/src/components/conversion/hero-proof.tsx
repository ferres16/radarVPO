import { proExclusiveFeatures } from '@/lib/pro';

export function HeroProof() {
  return (
    <ul className="lp-hero__proof" aria-label="Qué incluye VPO PRO">
      {proExclusiveFeatures.map((item) => (
        <li key={item}>
          <span className="lp-hero__proof-mark" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
