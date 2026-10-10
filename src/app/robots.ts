import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/administrar', '/api/auth/', '/api/anuncios/', '/api/views', '/cuenta', '/editar/', '/mis-anuncios', '/publicar', '/recuperar-clave'],
    },
    sitemap: 'https://cachis.net/sitemap.xml',
    host: 'https://cachis.net',
  };
}
