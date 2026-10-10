import Link from 'next/link';
import { currentUser } from '@/lib/auth/server';
import ListingForm from '@/components/listing-form';

export const dynamic = 'force-dynamic';
export const metadata={title:'Publicar anuncio'};
export default async function Publish({searchParams}:{searchParams:Promise<{error?:string}>}){
  const user=await currentUser();
  const {error}=await searchParams;
  return <main id="contenido" className="container publish-page"><div className="publish-intro"><div><p className="eyebrow">NUEVO ANUNCIO</p><h1>Publicar anuncio</h1><p className="lead">Completa los datos y muestra tu oferta a la comunidad.</p></div><Link href="/" className="publish-exit">Salir <span aria-hidden="true">×</span></Link></div>{user?<ListingForm defaultContactName={(user.name ?? '').trim().slice(0,80)} />:<div className="notice"><strong>{error==='account_not_linked'?'Ya existe una cuenta con este correo.':'Entra con Google para publicar.'}</strong><p>{error==='account_not_linked'?'Entra una vez con tu contraseña anterior y vincula Google desde «Tu cuenta» para conservar tus anuncios.':'Crear tu cuenta es gratis. Después volverás aquí para completar tu anuncio.'}</p><Link href={error==='account_not_linked'?'/cuenta?next=%2Fpublicar&link=google':'/cuenta?next=%2Fpublicar'} className="button">Iniciar sesión o registrarse</Link></div>}</main>;
}
