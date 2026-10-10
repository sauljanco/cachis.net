import 'server-only';
import { database } from '@/lib/db';

export async function siteViewCount(): Promise<number> {
  const rows = await database()`SELECT views FROM cachis.site_view_counts WHERE singleton = true`;
  return Number(rows[0]?.views ?? 0);
}

export async function recordSiteView(visitorId: string): Promise<number> {
  const rows = await database()`
    WITH recorded AS (
      INSERT INTO cachis.view_events (visitor_id, listing_id, viewed_on)
      VALUES (${visitorId}::uuid, NULL, current_date)
      ON CONFLICT DO NOTHING RETURNING 1
    ), bumped AS (
      INSERT INTO cachis.site_view_counts (singleton, views)
      SELECT true, 1 FROM recorded
      ON CONFLICT (singleton) DO UPDATE SET views = cachis.site_view_counts.views + 1
      RETURNING views
    )
    SELECT COALESCE((SELECT views FROM bumped),
      (SELECT views FROM cachis.site_view_counts WHERE singleton = true), 0) AS views`;
  return Number(rows[0]?.views ?? 0);
}

export async function recordListingView(visitorId: string, listingId: string): Promise<number | null> {
  const rows = await database()`
    WITH published AS (
      SELECT id FROM cachis.listings WHERE id = ${listingId}::uuid AND status = 'published'
    ), recorded AS (
      INSERT INTO cachis.view_events (visitor_id, listing_id, viewed_on)
      SELECT ${visitorId}::uuid, id, current_date FROM published
      ON CONFLICT DO NOTHING RETURNING listing_id
    ), bumped AS (
      INSERT INTO cachis.listing_view_counts (listing_id, views)
      SELECT listing_id, 1 FROM recorded
      ON CONFLICT (listing_id) DO UPDATE SET views = cachis.listing_view_counts.views + 1
      RETURNING views
    )
    SELECT COALESCE((SELECT views FROM bumped),
      (SELECT views FROM cachis.listing_view_counts WHERE listing_id = ${listingId}::uuid), 0) AS views
    WHERE EXISTS (SELECT 1 FROM published)`;
  return rows.length ? Number(rows[0].views) : null;
}
