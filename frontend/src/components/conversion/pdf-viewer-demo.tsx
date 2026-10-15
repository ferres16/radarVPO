/** Maqueta del visor. No reproduce un PDF real ni datos de una convocatoria. */
export function PdfViewerDemo() {
  return (
    <figure className="lp-product-demo">
      <figcaption className="lp-product-demo__caption">Así se ve el visor de PDF oficial</figcaption>
      <div className="lp-product-demo__chrome" aria-hidden="true">
        <div className="lp-product-demo__toolbar">
          <span>‹</span>
          <span>1 / 17</span>
          <span>›</span>
          <span className="lp-product-demo__zoom">100%</span>
          <span className="ml-auto">Abrir original</span>
        </div>
        <div className="lp-product-demo__page">
          <span className="lp-product-demo__line lp-product-demo__line--lg" />
          <span className="lp-product-demo__line" />
          <span className="lp-product-demo__line lp-product-demo__line--mid" />
          <span className="lp-product-demo__line" />
          <span className="lp-product-demo__line lp-product-demo__line--short" />
          <span className="lp-product-demo__line lp-product-demo__line--mid" />
          <span className="lp-product-demo__line" />
        </div>
      </div>
      <p className="lp-product-demo__note">Ejemplo de la interfaz. El documento real es el publicado por el organismo convocante.</p>
    </figure>
  );
}
