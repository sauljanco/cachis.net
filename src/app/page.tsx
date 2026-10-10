import { Suspense } from 'react';
import type { Metadata } from 'next';
import Marketplace from '@/components/marketplace';
import ViewCounter from '@/components/view-counter';
import { catalogPage } from '@/lib/repository';
import { parseCatalogFilters } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
const baseMetadata: Metadata = {
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

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = await searchParams;
  return { ...baseMetadata, robots: Object.keys(raw).length ? { index: false, follow: true } : { index: true, follow: true } };
}

export default async function Home({ searchParams }: Props) {
  const filters = parseCatalogFilters(await searchParams);
  const catalog = await catalogPage(filters);
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd).replace(/</g, '\u003c') }} />
    <ViewCounter kind="site" initialCount={0} hidden />
    <Suspense fallback={<main id="contenido" className="container marketplace-loading"><p>Cargando anuncios…</p></main>}>
      <Marketplace {...catalog} filters={{ ...filters, page: catalog.page }} />
    </Suspense>
  </>;
}
