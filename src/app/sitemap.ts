import type { MetadataRoute } from 'next';
import { database } from '@/lib/db';

// Keep newly approved listings discoverable on the next crawler request.
// Sitemap traffic is small; querying Neon here avoids stale edge copies.
export const dynamic = 'force-dynamic';
const origin = 'https://cachis.net';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await database()`SELECT id,updated_at FROM cachis.listings
    WHERE status='published' ORDER BY created_at DESC LIMIT 49997`;
  return [
    { url: origin },
    { url: origin + '/privacidad' },
    { url: origin + '/terminos' },
    ...rows.map(row => ({
      url: origin + '/anuncios/' + String(row.id),
      lastModified: new Date(String(row.updated_at)),
    })),
  ];
}
