import { Suspense } from 'react';
import Marketplace from '@/components/marketplace';
import { publicListings } from '@/lib/repository';
export const dynamic = 'force-dynamic';
export default async function Home() { const listings = await publicListings(); return <Suspense fallback={<main id="contenido">Cargando anuncios…</main>}><Marketplace listings={listings} /></Suspense>; }
