import type { StoredListing } from '@/lib/repository';

export const siteUrl = 'https://cachis.net';

export function listingJsonLd(listing: StoredListing) {
  const url = siteUrl + '/anuncios/' + listing.id;
  const image = listing.photos.map(photo => siteUrl + photo);
  const property = ['Lotes', 'Terrenos y parcelas', 'Casas y departamentos'].includes(listing.category);
  const vehicle = ['Motos', 'Vehículos'].includes(listing.category);
  const mainEntity = {
    '@type': property ? 'RealEstateListing' : vehicle ? 'Vehicle' : 'Product',
    name: listing.title,
    description: listing.description,
    url,
    ...(image.length ? { image } : {}),
    ...(property ? { about: { '@type': 'Place', name: listing.zone + ', San Julián, Santa Cruz' } } : {}),
    ...(listing.operation === 'Venta' ? {
      offers: { '@type': 'Offer', url, price: listing.price, priceCurrency: listing.currency },
    } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name: listing.title,
    description: listing.description,
    inLanguage: 'es-BO',
    mainEntity,
  };
}
