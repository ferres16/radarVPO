const items = [
  'Alertas SMS y email prioritarias',
  'Próximos lanzamientos en tu zona',
  'Curso VPO y checklist incluidos',
  'Seguimiento de municipios',
] as const;

export function HeroProof() {
  return (
    <ul className="lp-hero__proof" aria-label="Qué incluye VPO PRO">
      {items.map((item) => (
        <li key={item}>
          <span className="lp-hero__proof-mark" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
