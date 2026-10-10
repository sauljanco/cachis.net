export default function Loading() {
  return <main id="contenido" className="container marketplace marketplace-loading" aria-busy="true">
    <section className="search-area" aria-label="Cargando catálogo">
      <p>Cargando anuncios…</p>
      <div className="loading-bar" />
      <div className="loading-chips"><span /><span /><span /><span /></div>
    </section>
    <div className="loading-cards" aria-hidden="true"><span /><span /><span /><span /></div>
  </main>;
}
