import Link from 'next/link';
export default function NotFound(){return <main id="contenido" className="container empty"><p className="eyebrow">404</p><h1>No encontramos este anuncio</h1><p>Puede que el enlace sea incorrecto o que ya no esté disponible.</p><Link href="/" className="button">Explorar anuncios</Link></main>;}
