import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'cachis.net — San Julián',
    short_name: 'cachis',
    description: 'Compra, vende y alquila en San Julián.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fafbf8',
    theme_color: '#103f35',
    lang: 'es-BO',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
