import { Suspense } from 'react';
import Marketplace from '@/components/marketplace';
import { publicListings } from '@/lib/repository';
import { siteViewCount } from '@/lib/view-counts';
export const dynamic = 'force-dynamic';
export default async function Home() { const [listings, siteViews] = await Promise.all([publicListings(), siteViewCount()]); return <Suspense fallback={<main id="contenido">Cargando anuncios…</main>}><Marketplace listings={listings} siteViews={siteViews} /></Suspense>; }
