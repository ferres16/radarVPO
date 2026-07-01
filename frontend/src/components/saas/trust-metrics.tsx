const metrics = [
  { value: '120+', label: 'Promociones monitorizadas' },
  { value: '3.2k', label: 'Usuarios activos' },
  { value: '48h', label: 'Antelación media alertas' },
  { value: '9,99 €', label: 'VPO PRO al mes' },
] as const;

export function TrustMetrics() {
  return (
    <div className="trust-strip" aria-label="Métricas de confianza">
      {metrics.map((metric) => (
        <div key={metric.label} className="trust-strip__item">
          <p className="trust-strip__value">{metric.value}</p>
          <p className="trust-strip__label">{metric.label}</p>
        </div>
      ))}
    </div>
  );
}
