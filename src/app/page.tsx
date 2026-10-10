import { Suspense } from 'react';
import type { Metadata } from 'next';
import Marketplace from '@/components/marketplace';
import ViewCounter from '@/components/view-counter';
import { publicListings } from '@/lib/repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Compra y vende en San Julián, Santa Cruz',
  description: 'Encuentra motos, vehículos, terrenos, casas, maquinaria y electrónicos publicados en San Julián. Explora anuncios y contacta directamente con cada anunciante.',
  alternates: { canonical: 'https://cachis.net' },
  openGraph: { type: 'website', locale: 'es_BO', siteName: 'cachis.net', url: 'https://cachis.net', title: 'Compra y vende en San Julián, Santa Cruz', description: 'Explora anuncios de motos, vehículos, terrenos, casas, maquinaria y electrónicos en San Julián.' },
  robots: { index: true, follow: true },
};

const homeJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': 'https://cachis.net/#organization', name: 'cachis.net', url: 'https://cachis.net/', logo: 'https://cachis.net/brand-logo.png' },
    { '@type': 'WebSite', '@id': 'https://cachis.net/#website', name: 'cachis.net', url: 'https://cachis.net/', inLanguage: 'es-BO', publisher: { '@id': 'https://cachis.net/#organization' } },
  ],
};

export default async function Home() {
  const listings = await publicListings();
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, '\\u003c') }} />
    <ViewCounter kind="site" initialCount={0} hidden />
    <Suspense fallback={<main id="contenido" className="container marketplace-loading"><p>Cargando anuncios…</p></main>}>
      <Marketplace listings={listings} />
    </Suspense>
  </>;
}
