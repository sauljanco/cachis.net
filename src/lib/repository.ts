import 'server-only';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { database } from './db';
import type { Listing } from './listings';
import { CATALOG_PAGE_SIZE, type CatalogFilters } from './catalog';

export type StoredListing = Listing & { ownerId: string; status: string; whatsapp: string; contactName: string; photos: string[]; photoCount: number; latitude: number | null; longitude: number | null };
function mapRow(row: Record<string, unknown>): StoredListing {
  return { id: String(row.id), title: String(row.title), category: row.category as Listing['category'], operation: row.operation as Listing['operation'], price: Number(row.price), currency: row.currency as Listing['currency'], zone: String(row.zone), description: String(row.description), facts: [], image: row.photo_id ? '/api/fotos/'+String(row.photo_id) : '', views: Number(row.views ?? 0), ownerId: String(row.owner_id), status: String(row.status), whatsapp: String(row.whatsapp), contactName: String(row.contact_name), photos: [], photoCount: Number(row.photo_count ?? 0), latitude: row.latitude == null ? null : Number(row.latitude), longitude: row.longitude == null ? null : Number(row.longitude) };
}
async function uncachedCatalogPage(filters: CatalogFilters) {
  const sql = database();
  const parameters: unknown[] = [];
  const bind = (value: unknown) => { parameters.push(value); return '$' + parameters.length; };
  const conditions = ["l.status='published'"];
  if (filters.category !== 'Todo') conditions.push('l.category=' + bind(filters.category));
  if (filters.zone !== 'Todas') conditions.push('l.zone=' + bind(filters.zone));
  if (filters.operation !== 'Todas') conditions.push('l.operation=' + bind(filters.operation));
  if (filters.currency !== 'Todas') conditions.push('l.currency=' + bind(filters.currency));
  if (filters.max !== null) conditions.push('l.price<=' + bind(filters.max));
  if (filters.query) {
    const text = bind(filters.query);
    const searchable = "translate(lower(concat_ws(' ',l.title,l.category,l.zone,l.description)),'áéíóúüñ','aeiouun')";
    conditions.push("strpos(" + searchable + ",translate(lower(" + text + "),'áéíóúüñ','aeiouun'))>0");
  }
  if (filters.favorites) {
    if (filters.ids.length === 0) conditions.push('false');
    else conditions.push('l.id IN (' + filters.ids.map(bind).join(',') + ')');
  }
  const where = conditions.join(' AND ');
  const [counts, zoneRows] = await Promise.all([
    sql.query('SELECT count(*)::int AS total FROM cachis.listings l WHERE ' + where, parameters),
    sql`SELECT DISTINCT zone FROM cachis.listings WHERE status='published' AND zone<>'' ORDER BY zone LIMIT 300`,
  ]);
  const total = Number(counts[0]?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  const page = Math.min(filters.page, pages);
  const order = filters.sort === 'low' ? 'l.price ASC,l.created_at DESC,l.id DESC' :
    filters.sort === 'high' ? 'l.price DESC,l.created_at DESC,l.id DESC' :
    'l.created_at DESC,l.id DESC';
  const rows = await sql.query(`SELECT l.id,l.title,l.category,l.operation,l.price,l.currency,l.zone,'' AS description,
    COALESCE(v.views,0) AS views,
    (SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id
    FROM cachis.listings l LEFT JOIN cachis.listing_view_counts v ON v.listing_id=l.id
    WHERE ${where} ORDER BY ${order} LIMIT ${bind(CATALOG_PAGE_SIZE)} OFFSET ${bind((page-1)*CATALOG_PAGE_SIZE)}`, parameters);
  const listings = rows.map(mapRow).map(({ownerId,status,whatsapp,contactName,photos,photoCount,latitude,longitude,...listing}) => listing);
  return { listings, total, page, pages, zones: zoneRows.map(row => String(row.zone)) };
}
const cachedCatalogPage = unstable_cache(uncachedCatalogPage, ['public-catalog-v1'], { tags: ['public-catalog'], revalidate: 60 });
export async function catalogPage(filters: CatalogFilters) {
  // Los guardados dependen del navegador; el resto del catálogo se comparte un minuto.
  return filters.favorites ? uncachedCatalogPage(filters) : cachedCatalogPage(filters);
}
export const findListing = cache(async (id: string) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const sql = database();
  const rows = await sql`SELECT l.*,COALESCE(v.views,0) AS views,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id FROM cachis.listings l LEFT JOIN cachis.listing_view_counts v ON v.listing_id=l.id WHERE l.id=${id} AND l.status='published'`;
  if (!rows[0]) return null;
  const listing = mapRow(rows[0]);
  const photos = await sql`SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=${id} ORDER BY p.position LIMIT 3`;
  listing.photos = photos.map(photo => '/api/fotos/' + String(photo.id));
  listing.photoCount = listing.photos.length;
  return listing;
});
export async function ownerListings(ownerId: string) {
  return (await database()`SELECT l.*,COALESCE(v.views,0) AS views,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id,(SELECT count(*) FROM cachis.listing_photos p WHERE p.listing_id=l.id) AS photo_count FROM cachis.listings l LEFT JOIN cachis.listing_view_counts v ON v.listing_id=l.id WHERE l.owner_id=${ownerId} AND l.status<>'deleted' ORDER BY l.created_at DESC LIMIT 100`).map(mapRow);
}
export async function ownerListing(id: string, ownerId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const rows = await database()`SELECT l.*,(SELECT count(*) FROM cachis.listing_photos p WHERE p.listing_id=l.id) AS photo_count FROM cachis.listings l WHERE l.id=${id} AND l.owner_id=${ownerId} AND l.status<>'deleted'`;
  return rows[0] ? mapRow(rows[0]) : null;
}
