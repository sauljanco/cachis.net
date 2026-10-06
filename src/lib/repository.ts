import 'server-only';
import { database } from './db';
import type { Listing } from './listings';

export type StoredListing = Listing & { ownerId: string; status: string; whatsapp: string; contactName: string };
function mapRow(row: Record<string, unknown>): StoredListing {
  return { id: String(row.id), title: String(row.title), category: row.category as Listing['category'], operation: row.operation as Listing['operation'], price: Number(row.price), zone: String(row.zone), description: String(row.description), facts: [], image: row.photo_id ? '/api/fotos/'+String(row.photo_id) : '', ownerId: String(row.owner_id), status: String(row.status), whatsapp: String(row.whatsapp), contactName: String(row.contact_name) };
}
export async function publicListings() {
  const sql = database();
  const rows = await sql`SELECT l.id,l.title,l.category,l.operation,l.price,l.zone,l.description,
    (SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id
    FROM cachis.listings l WHERE l.status='published' ORDER BY l.created_at DESC LIMIT 100`;
  return rows.map(mapRow).map(({ownerId,status,whatsapp,contactName,...listing}) => listing);
}
export async function findListing(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const rows = await database()`SELECT l.*,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id FROM cachis.listings l WHERE l.id=${id} AND l.status='published'`;
  return rows[0] ? mapRow(rows[0]) : null;
}
export async function ownerListings(ownerId: string) {
  return (await database()`SELECT l.*,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id FROM cachis.listings l WHERE l.owner_id=${ownerId} ORDER BY l.created_at DESC LIMIT 100`).map(mapRow);
}
export async function ownerListing(id: string, ownerId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const rows = await database()`SELECT l.* FROM cachis.listings l WHERE l.id=${id} AND l.owner_id=${ownerId}`;
  return rows[0] ? mapRow(rows[0]) : null;
}
