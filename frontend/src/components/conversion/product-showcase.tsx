export function ProductShowcase() {
  return (
    <div className="product-showcase" aria-hidden="true">
      <div className="product-showcase__chrome">
        <div className="product-showcase__dots">
          <span /><span /><span />
        </div>
        <span className="product-showcase__url">app.radar-vpo.com</span>
      </div>
      <div className="product-showcase__body">
        <aside className="product-showcase__nav">
          <p className="product-showcase__brand">Radar VPO</p>
          <ul>
            <li className="is-active">Alertas</li>
            <li>Promociones</li>
            <li>Mapa</li>
            <li>Curso</li>
          </ul>
        </aside>
        <div className="product-showcase__main">
          <div className="product-showcase__header">
            <div>
              <p className="product-showcase__label">Próximo lanzamiento</p>
              <p className="product-showcase__title">HPO Sant Boi — estimado 12 días</p>
            </div>
            <span className="product-showcase__badge">PRO activo</span>
          </div>
          <div className="product-showcase__grid">
            <article className="product-showcase__card">
              <p className="product-showcase__card-label">SMS enviado</p>
              <p className="product-showcase__card-text">Nueva promoción VPO en tu municipio. Plazo abierto 48h.</p>
              <time>hace 2 min</time>
            </article>
            <article className="product-showcase__card">
              <p className="product-showcase__card-label">Email</p>
              <p className="product-showcase__card-text">Checklist actualizado: documentos listos para presentar.</p>
              <time>hace 1 h</time>
            </article>
            <article className="product-showcase__card product-showcase__card--map">
              <p className="product-showcase__card-label">Municipios seguidos</p>
              <div className="product-showcase__pins">
                <span>BCN</span>
                <span>STB</span>
                <span>GIR</span>
              </div>
            </article>
            <article className="product-showcase__card product-showcase__card--calendar">
              <p className="product-showcase__card-label">Calendario</p>
              <div className="product-showcase__days">
                <span>8</span><span className="is-hot">9</span><span>10</span><span>11</span>
              </div>
              <p className="product-showcase__card-text">Publicación estimada</p>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
