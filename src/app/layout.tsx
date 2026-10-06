import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import ServiceWorkerRegistration from '@/components/service-worker-registration';
import './globals.css';
export const metadata: Metadata = { title: { default: 'cachis.net | Compra y vende en San Julián', template: '%s | cachis.net' }, description: 'Motos, vehículos, lotes, alquileres y anticréticos en San Julián, Santa Cruz. Precios en bolivianos.', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: '#124d3e' };
export default function Layout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="es-BO"><body><ServiceWorkerRegistration/><a className="skip" href="#contenido">Ir al contenido</a><div className="demo-bar">Piloto de San Julián · Los anuncios publicados pasan por revisión.</div><header className="header"><Link href="/" className="brand" aria-label="cachis.net inicio">cachis<span>.net</span><i>↗</i></Link><span className="location">◎ San Julián, Santa Cruz</span><nav><Link href="/?favoritos=1" className="nav-favorites">♡ Guardados</Link><Link href="/mis-anuncios" className="nav-account">Mis anuncios</Link><Link href="/cuenta" className="nav-account">Cuenta</Link><Link href="/publicar" className="button small">＋ Publicar anuncio</Link></nav></header>{children}<footer><Link href="/" className="brand">cachis<span>.net</span></Link><p>De aquí, para los de aquí.</p><span>San Julián · Santa Cruz · Bolivia</span><small>Piloto local de cachis.net. Confirma la información de cada oferta con su anunciante.</small></footer></body></html>;
}
