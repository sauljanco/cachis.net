import Link from 'next/link';
import { currentUser } from '@/lib/auth/server';
import ListingForm from '@/components/listing-form';

export const dynamic = 'force-dynamic';
export const metadata={title:'Publicar anuncio'};
export default async function Publish(){
  const user=await currentUser();
  return <main id="contenido" className="container publish-page"><Link href="/" className="back">← Volver a los anuncios</Link><p className="eyebrow">TU PRÓXIMA OPORTUNIDAD EMPIEZA AQUÍ</p><h1>Publicar anuncio</h1><p className="lead">Cuéntanos qué tienes para ofrecer en San Julián.</p>{user?<><div className="notice"><strong>Revisaremos tu anuncio antes de mostrarlo.</strong><p>Podrás consultar su estado en «Mis anuncios».</p></div><ListingForm /></>:<div className="notice"><strong>Necesitas una cuenta para publicar.</strong><p>El registro es gratuito. Así podrás gestionar tus anuncios y recibir consultas.</p><Link href="/cuenta" className="button">Iniciar sesión o crear cuenta</Link></div>}</main>;
}
