'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/icon';
import CategoryIcon from '@/components/category-icon';
import { CATALOG_PAGE_SIZE, catalogUrl, type CatalogFilters } from '@/lib/catalog';
import { listingImageLoader } from '@/lib/listing-image';
import { money, type Currency, type Listing } from '@/lib/listings';

const categories = [
  { name: 'Todo', icon: 'grid' },
  { name: 'Motos', icon: 'bike' },
  { name: 'Vehículos', icon: 'car' },
  { name: 'Lotes', icon: 'land' },
  { name: 'Terrenos y parcelas', label: 'Terrenos', icon: 'field' },
  { name: 'Casas y departamentos', label: 'Casas y deptos.', icon: 'home' },
  { name: 'Maquinaria agrícola', label: 'Maquinaria', icon: 'tractor' },
  { name: 'Electrónicos', icon: 'electronics' },
  { name: 'Otros', icon: 'other' },
] as const;

type Props = {
  listings: Listing[];
  total: number;
  page: number;
  pages: number;
  zones: string[];
  filters: CatalogFilters;
};

export default function Marketplace({ listings, total, page, pages, zones, filters }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [queryDraft, setQueryDraft] = useState(filters.query);
  const [maxDraft, setMaxDraft] = useState(filters.max === null ? '' : String(filters.max));
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [storageMessage, setStorageMessage] = useState('');
  const requestedIds = useRef<string | null>(null);
  const onlyFavorites = filters.favorites;

  const navigate = useCallback((patch: Partial<CatalogFilters>) => {
    const next = { ...filters, ...patch, page: 1 };
    startTransition(() => router.replace(catalogUrl(next), { scroll: false }));
  }, [filters, router]);

  useEffect(() => { setQueryDraft(filters.query); }, [filters.query]);
  useEffect(() => { setMaxDraft(filters.max === null ? '' : String(filters.max)); }, [filters.max]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cachis:favorites') || '[]');
      if (Array.isArray(saved)) setFavorites(saved.filter((id: unknown): id is string => typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)).slice(0, 150));
    } catch {
      setStorageMessage('No pudimos recuperar tus guardados en este navegador.');
    }
    setFavoritesLoaded(true);
  }, []);

  useEffect(() => {
    if (!favoritesLoaded || !onlyFavorites) return;
    const desired = favorites.join(',');
    if (filters.ids.join(',') === desired) { requestedIds.current = null; return; }
    if (requestedIds.current === desired) return;
    requestedIds.current = desired;
    navigate({ ids: favorites });
  }, [favoritesLoaded, onlyFavorites, favorites, filters.ids, navigate]);

  useEffect(() => {
    if (queryDraft.trim() === filters.query) return;
    const timer = setTimeout(() => navigate({ query: queryDraft.trim().slice(0, 100) }), 350);
    return () => clearTimeout(timer);
  }, [queryDraft, filters.query, navigate]);

  useEffect(() => {
    const parsed = maxDraft.trim() ? Number(maxDraft) : null;
    const valid = parsed !== null && Number.isFinite(parsed) && parsed > 0 ? parsed : null;
    if (valid === filters.max) return;
    const timer = setTimeout(() => navigate({ max: valid }), 350);
    return () => clearTimeout(timer);
  }, [maxDraft, filters.max, navigate]);

  function toggle(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id].slice(-150);
    setFavorites(next);
    try { localStorage.setItem('cachis:favorites', JSON.stringify(next)); }
    catch { setStorageMessage('Los guardados solo se conservarán durante esta visita.'); }
  }

  function reset() {
    setQueryDraft('');
    setMaxDraft('');
    navigate({ query: '', category: 'Todo', operation: 'Todas', zone: 'Todas', currency: 'Todas', max: null, sort: 'recent' });
  }

  const favoritesSyncing = onlyFavorites && (!favoritesLoaded || filters.ids.join(',') !== favorites.join(','));
  const visibleListings = onlyFavorites && favoritesLoaded ? listings.filter(x => favorites.includes(x.id)) : listings;
  const first = total ? (page - 1) * CATALOG_PAGE_SIZE + 1 : 0;
  const last = Math.min(page * CATALOG_PAGE_SIZE, total);

  return <main id="contenido" className="container marketplace">
    <section aria-label="Buscar anuncios" className="search-area">
      <h1 className="marketplace-headline">Encuentra lo que buscas, cerca de ti</h1>
      <form className="search-row" onSubmit={event => { event.preventDefault(); navigate({ query: queryDraft.trim() }); document.getElementById('resultados')?.scrollIntoView(); }}>
        <label className="search-input"><input value={queryDraft} onChange={event => setQueryDraft(event.target.value)} placeholder="Busca motos, terrenos, vehículos y mucho más..." aria-label="Buscar anuncios" maxLength={100} /></label>
        <button type="submit" className="button search-submit" aria-label="Buscar anuncios"><Icon name="search" /></button>
      </form>
      <div className="category-heading"><span>Explora por categoría</span></div>
      <div className="categories" role="group" aria-label="Categorías">{categories.map(c => <button key={c.name} type="button" aria-label={c.name} aria-pressed={filters.category === c.name} className={filters.category === c.name ? 'category active' : 'category'} onClick={() => navigate({ category: c.name })}><span className="category-icon"><CategoryIcon name={c.icon} /></span><span>{'label' in c ? c.label : c.name}</span></button>)}</div>
    </section>

    <section id="resultados" className="results" aria-busy={pending}>
      <div className="results-header"><div className="results-title"><h2 className="catalog-title">{onlyFavorites ? 'Tus anuncios guardados' : 'Todos los anuncios disponibles'}</h2></div><label className="sort">Ordenar por<select value={filters.sort} onChange={event => navigate({ sort: event.target.value as CatalogFilters['sort'] })}><option value="recent">Más recientes</option><option value="low" disabled={filters.currency === 'Todas'}>Menor precio</option><option value="high" disabled={filters.currency === 'Todas'}>Mayor precio</option></select></label></div>
      <div className="filters"><span className="filter-label"><Icon name="sliders" /> Filtrar</span><label className="filter-operation">Operación<select value={filters.operation} onChange={event => navigate({ operation: event.target.value as CatalogFilters['operation'] })}><option>Todas</option><option>Venta</option><option>Alquiler</option><option>Anticrético</option></select></label><label className="filter-zone">Ubicación<select value={filters.zone} onChange={event => navigate({ zone: event.target.value })}><option value="Todas">Todas las zonas</option>{zones.map(value => <option key={value} value={value}>{value}</option>)}</select></label><label className="filter-currency">Moneda<select value={filters.currency} onChange={event => { const currency = event.target.value as Currency | 'Todas'; setMaxDraft(''); navigate({ currency, max: null, sort: 'recent' }); }}><option value="Todas">Todas</option><option value="BOB">Bolivianos (Bs)</option><option value="USD">Dólares (US$)</option></select></label><label className="filter-max">Precio máximo{filters.currency === 'BOB' ? ' (Bs)' : filters.currency === 'USD' ? ' (US$)' : ''}<input type="number" min="0" value={maxDraft} onChange={event => setMaxDraft(event.target.value)} placeholder={filters.currency === 'Todas' ? 'Elige moneda' : 'Sin límite'} disabled={filters.currency === 'Todas'} /></label><button type="button" className="text-button" onClick={reset}>Limpiar filtros</button>{onlyFavorites && <Link href="/" className="text-button favorites-all">Ver todos</Link>}<span className="count" role="status">{total} {total === 1 ? 'anuncio' : 'anuncios'}</span></div>
      {storageMessage && <p role="status">{storageMessage}</p>}
      {favoritesSyncing && <p className="catalog-pending" role="status">Cargando guardados…</p>}
      <div className="grid">{visibleListings.map((x, index) => <article className="card" key={x.id}>
        <Link className="card-main-link" href={'/anuncios/' + x.id} aria-label={`Ver anuncio: ${x.title}, ${money(x.price, x.currency)}, ${x.zone}`}>
          <div className="card-image">
            {x.image ? <Image src={x.image} loader={listingImageLoader} alt={'Foto de ' + x.title} fill sizes="(max-width: 650px) 40vw, (max-width: 780px) 50vw, (max-width: 1100px) 33vw, 25vw" loading={index === 0 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : undefined} /> : <span className="photo-placeholder">Fotografías próximamente</span>}
            <span className={'badge ' + (x.operation === 'Alquiler' ? 'rental' : '')}>{x.operation}</span>
          </div>
          <div className="card-body">
            <p className="card-category">{x.category}</p>
            <span className="card-title">{x.title}</span>
            <p className="price">{money(x.price, x.currency)}{x.operation === 'Alquiler' && <small> / mes</small>}</p>
            {x.facts.length > 0 && <p className="facts">{x.facts.join(' · ')}</p>}
            <div className="card-bottom"><span><Icon name="pin" /> {x.zone}</span><span className="card-views" title="Visualizaciones del anuncio"><Icon name="eye" /> {new Intl.NumberFormat('es-BO').format(x.views)}</span></div>
          </div>
        </Link>
        <button type="button" className={'heart ' + (favorites.includes(x.id) ? 'saved' : '')} aria-label={(favorites.includes(x.id) ? 'Quitar de guardados: ' : 'Guardar: ') + x.title} aria-pressed={favorites.includes(x.id)} onClick={() => toggle(x.id)}><Icon name="heart" fill={favorites.includes(x.id) ? 'currentColor' : 'none'} /></button>
      </article>)}</div>
      {!favoritesSyncing && !visibleListings.length && <div className="empty"><span className="empty-icon"><Icon name="search" /></span><h3>{onlyFavorites ? 'No hay guardados con estos filtros' : 'Todavía no hay anuncios con estos filtros'}</h3><p>Prueba otra búsqueda o cambia los filtros. También puedes ser de los primeros en publicar.</p><div className="empty-actions"><button type="button" className="button" onClick={reset}>Limpiar filtros</button><Link className="button empty-publish" href="/publicar">Publicar anuncio <Icon name="arrow" /></Link></div></div>}
      {pages > 1 && <nav className="catalog-pagination" aria-label="Páginas de anuncios">
        {page > 1 ? <Link href={catalogUrl(filters, page - 1)} rel="prev">← Anteriores</Link> : <span />}
        <span>Mostrando {first}–{last} de {total}</span>
        {page < pages ? <Link href={catalogUrl(filters, page + 1)} rel="next">Siguientes →</Link> : <span />}
      </nav>}
    </section>
  </main>;
}
