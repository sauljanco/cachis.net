'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Icon from '@/components/icon';
import CategoryIcon from '@/components/category-icon';
import { money, normalize, type Listing } from '@/lib/listings';

const categories = [
  { name: 'Todo', icon: 'grid' },
  { name: 'Motos', icon: 'bike' },
  { name: 'Vehículos', icon: 'car' },
  { name: 'Lotes', icon: 'land' },
  { name: 'Casas y departamentos', icon: 'home' },
] as const;

export default function Marketplace({ listings }: { listings: Listing[] }) {
  const params = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todo');
  const [operation, setOperation] = useState('Todas');
  const [max, setMax] = useState('');
  const [sort, setSort] = useState('recent');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [storageMessage, setStorageMessage] = useState('');
  const onlyFavorites = params.get('favoritos') === '1';

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('cachis:favorites') || '[]');
      if (Array.isArray(saved)) setFavorites(saved.filter((id: unknown): id is string => typeof id === 'string'));
    } catch {
      setStorageMessage('No pudimos recuperar tus guardados en este navegador.');
    }
  }, []);

  function toggle(id: string) {
    const next = favorites.includes(id) ? favorites.filter(x => x !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem('cachis:favorites', JSON.stringify(next)); }
    catch { setStorageMessage('Los guardados solo se conservarán durante esta visita.'); }
  }

  function reset() { setQuery(''); setCategory('Todo'); setOperation('Todas'); setMax(''); }

  const filtered = listings.filter(x =>
    (category === 'Todo' || x.category === category) &&
    (operation === 'Todas' || x.operation === operation) &&
    (!max || x.price <= Number(max)) &&
    (!onlyFavorites || favorites.includes(x.id)) &&
    normalize([x.title, x.category, x.zone, ...x.facts].join(' ')).includes(normalize(query))
  ).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : 0);

  return <main id="contenido" className="container marketplace">
    <section aria-label="Buscar anuncios" className="search-area">
      <div className="search-row">
        <label className="search-input"><Icon name="search" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca una moto, un lote, una casa..." aria-label="Buscar anuncios" /></label>
        <span className="search-location"><Icon name="pin" /> San Julián</span>
        <a href="#resultados" className="button search-submit">Buscar <Icon name="arrow" /></a>
      </div>
      <div className="category-heading"><span>Explora por categoría</span><span>Encuentra lo que necesitas, cerca de casa.</span></div>
      <div className="categories" aria-label="Categorías">{categories.map(c => <button key={c.name} type="button" aria-pressed={category === c.name} className={category === c.name ? 'category active' : 'category'} onClick={() => setCategory(c.name)}><span className="category-icon"><CategoryIcon name={c.icon} /></span><span>{c.name}</span></button>)}</div>
    </section>

    <section id="resultados" className="results">
      <div className="results-header"><h1 className="catalog-title">{onlyFavorites ? 'Tus anuncios guardados' : 'Todos los anuncios disponibles'}</h1><label className="sort">Ordenar por<select value={sort} onChange={e => setSort(e.target.value)}><option value="recent">Más recientes</option><option value="low">Menor precio</option><option value="high">Mayor precio</option></select></label></div>
      <div className="filters"><span className="filter-label"><Icon name="sliders" /> Filtrar</span><label>Operación<select value={operation} onChange={e => setOperation(e.target.value)}><option>Todas</option><option>Venta</option><option>Alquiler</option><option>Anticrético</option></select></label><label>Precio máximo (Bs)<input type="number" min="0" value={max} onChange={e => setMax(e.target.value)} placeholder="Sin límite" /></label><button className="text-button" onClick={reset}>Limpiar filtros</button>{onlyFavorites && <Link href="/" className="text-button favorites-all">Ver todos</Link>}<span className="count" role="status">{filtered.length} {filtered.length === 1 ? 'anuncio' : 'anuncios'}</span></div>
      {storageMessage && <p role="status">{storageMessage}</p>}
      <div className="grid">{filtered.map(x => <article className="card" key={x.id}><div className="card-image"><Link href={'/anuncios/' + x.id} className="photo-placeholder">{x.image ? <Image src={x.image} alt={'Foto de ' + x.title} fill unoptimized sizes="(max-width: 650px) 100vw, (max-width: 1000px) 50vw, 33vw" /> : 'Fotografías próximamente'}</Link><span className={'badge ' + (x.operation === 'Alquiler' ? 'rental' : '')}>{x.operation}</span><button className={'heart ' + (favorites.includes(x.id) ? 'saved' : '')} aria-label={(favorites.includes(x.id) ? 'Quitar de guardados: ' : 'Guardar: ') + x.title} aria-pressed={favorites.includes(x.id)} onClick={() => toggle(x.id)}><Icon name="heart" fill={favorites.includes(x.id) ? 'currentColor' : 'none'} /></button></div><div className="card-body"><p className="card-category">{x.category}</p><Link className="card-title" href={'/anuncios/' + x.id}>{x.title}</Link><p className="price">{money(x.price)}{x.operation === 'Alquiler' && <small> / mes</small>}</p><p className="facts">{x.facts.join(' · ')}</p><div className="card-bottom"><span><Icon name="pin" /> {x.zone}</span><span>San Julián</span></div></div></article>)}</div>
      {!filtered.length && <div className="empty"><span className="empty-icon"><Icon name="search" /></span><h3>{onlyFavorites ? 'No hay guardados con estos filtros' : 'Todavía no hay anuncios con estos filtros'}</h3><p>Prueba otra búsqueda o cambia los filtros. También puedes ser de los primeros en publicar.</p><div className="empty-actions"><button className="button" onClick={reset}>Limpiar filtros</button><Link className="button empty-publish" href="/publicar">Publicar anuncio <Icon name="arrow" /></Link></div></div>}
    </section>

  </main>;
}
