import type { Category, Currency, Operation } from './listings';

export const CATALOG_PAGE_SIZE = 24;
const categories: Category[] = ['Motos', 'Vehículos', 'Lotes', 'Terrenos y parcelas', 'Casas y departamentos', 'Maquinaria agrícola', 'Electrónicos', 'Otros'];
const operations: Operation[] = ['Venta', 'Alquiler', 'Anticrético'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type CatalogFilters = {
  query: string;
  category: Category | 'Todo';
  zone: string;
  operation: Operation | 'Todas';
  currency: Currency | 'Todas';
  max: number | null;
  sort: 'recent' | 'low' | 'high';
  page: number;
  favorites: boolean;
  ids: string[];
};

type RawParams = Record<string, string | string[] | undefined>;
const first = (value: string | string[] | undefined) => typeof value === 'string' ? value : (value?.[0] ?? '');

export function parseCatalogFilters(raw: RawParams): CatalogFilters {
  const category = first(raw.categoria);
  const operation = first(raw.operacion);
  const currency = first(raw.moneda);
  const sort = first(raw.orden);
  const page = Number(first(raw.pagina));
  const max = Number(first(raw.max));
  return {
    query: first(raw.q).trim().slice(0, 100),
    category: categories.includes(category as Category) ? category as Category : 'Todo',
    zone: first(raw.zona).trim().slice(0, 80) || 'Todas',
    operation: operations.includes(operation as Operation) ? operation as Operation : 'Todas',
    currency: currency === 'BOB' || currency === 'USD' ? currency : 'Todas',
    max: (currency === 'BOB' || currency === 'USD') && Number.isFinite(max) && max > 0 && max <= 1_000_000_000_000 ? max : null,
    sort: (currency === 'BOB' || currency === 'USD') && (sort === 'low' || sort === 'high') ? sort : 'recent',
    page: Number.isSafeInteger(page) && page > 0 ? Math.min(page, 10_000) : 1,
    favorites: first(raw.favoritos) === '1',
    ids: [...new Set(first(raw.ids).split(',').filter(id => uuid.test(id)))].slice(0, 150),
  };
}

export function catalogUrl(filters: CatalogFilters, page = filters.page) {
  const params = new URLSearchParams();
  if (filters.query) params.set('q', filters.query);
  if (filters.category !== 'Todo') params.set('categoria', filters.category);
  if (filters.zone !== 'Todas') params.set('zona', filters.zone);
  if (filters.operation !== 'Todas') params.set('operacion', filters.operation);
  if (filters.currency !== 'Todas') params.set('moneda', filters.currency);
  if (filters.max !== null) params.set('max', String(filters.max));
  if (filters.sort !== 'recent') params.set('orden', filters.sort);
  if (filters.favorites) {
    params.set('favoritos', '1');
    if (filters.ids.length) params.set('ids', filters.ids.join(','));
  }
  if (page > 1) params.set('pagina', String(page));
  const search = params.toString();
  return search ? '/?' + search : '/';
}
