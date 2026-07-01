export function ProductPreview() {
  return (
    <div className="product-frame" aria-hidden="true">
      <div className="product-frame__chrome">
        <span className="product-frame__dot product-frame__dot--green" />
        <span className="product-frame__dot" />
        <span className="product-frame__dot" />
        <span className="ml-2 text-xs font-semibold text-[var(--ink-soft)]">Radar VPO · Panel PRO</span>
      </div>
      <div className="product-frame__body">
        <div className="product-frame__row">
          <div className="product-mini-card">
            <p className="product-mini-card__label">Alerta nueva</p>
            <p className="product-mini-card__title">VPO Sant Cugat · 48 viviendas</p>
            <span className="product-mini-card__chip">SMS enviado</span>
          </div>
          <div className="product-mini-card">
            <p className="product-mini-card__label">Próximo plazo</p>
            <p className="product-mini-card__title">Publicación estimada en 12 días</p>
            <span className="product-mini-card__chip">Urgente</span>
          </div>
        </div>
        <div className="product-mini-card">
          <p className="product-mini-card__label">Promoción publicada</p>
          <p className="product-mini-card__title">Cooperativa Barcelona · requisitos y documentación listos</p>
          <span className="product-mini-card__chip">Ficha completa</span>
        </div>
      </div>
    </div>
  );
}
