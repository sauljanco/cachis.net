import type { Metadata, Viewport } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/icon';
import AccountNav from '@/components/account-nav';
import ServiceWorkerRegistration from '@/components/service-worker-registration';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://cachis.net'),
  title: { default: 'cachis.net | Compra y vende en San Julián', template: '%s | cachis.net' },
  description: 'Motos, vehículos, inmuebles, electrónicos y más en San Julián, Santa Cruz. Precios en bolivianos.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: '#103f35' };

function Brand() {
  return <Link href="/" className="brand" aria-label="cachis.net — volver al inicio"><Image src="/brand-logo.png" alt="cachis.net" width={220} height={55} priority /></Link>;
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-BO"><body>
    <ServiceWorkerRegistration />
    <a className="skip" href="#contenido">Ir al contenido</a>
    <header className="header">
      <Brand />
      <span className="location"><Icon name="pin" /> San Julián, Santa Cruz</span>
      <nav aria-label="Navegación principal">
        <Link href="/?favoritos=1" className="nav-favorites" aria-label="Guardados"><Icon name="heart" /><span>Guardados</span></Link>
        <Link href="/mis-anuncios" className="nav-account">Mis anuncios</Link>
        <AccountNav />
        <Link href="/publicar" className="button small"><Icon name="plus" /><span className="publish-label-desktop">Publicar anuncio</span><span className="publish-label-mobile">Publicar</span></Link>
      </nav>
    </header>
    {children}
    <footer><Brand /><p>De aquí, para los de aquí.</p><Link href="/?favoritos=1" className="footer-favorites">Guardados</Link><span>San Julián · Santa Cruz · Bolivia</span><small>Confirma la información de cada oferta con su anunciante.</small></footer>
  </body></html>;
}
