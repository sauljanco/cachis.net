import Link from 'next/link';
import Image from 'next/image';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { ownerListings } from '@/lib/repository';
import { money } from '@/lib/listings';
import ListingControls from '@/components/listing-controls';
import PhotoUpload from '@/components/photo-upload';

export const dynamic='force-dynamic';
export const metadata={title:'Mis anuncios'};
const statusLabel:Record<string,string>={pending:'En revisión',published:'Publicado',paused:'Pausado',closed:'Cerrado',rejected:'No aprobado'};
export default async function MyListings(){
  const user=await currentUser();
  if(!user)return <main id="contenido" className="container publish-page"><h1>Mis anuncios</h1><p>Inicia sesión para ver tus anuncios.</p><Link href="/cuenta" className="button">Ir a mi cuenta</Link></main>;
  const listings=await ownerListings(user.id);
  return <main id="contenido" className="container publish-page"><h1>Mis anuncios</h1><p>Los anuncios se muestran en el catálogo después de la revisión.</p><div className="owner-shortcuts"><Link href="/publicar" className="button">Crear anuncio</Link>{isAdmin(user.id)&&<Link href="/administrar" className="button owner-admin-link">Ir a administración</Link>}</div>{listings.length?<div className="my-listings">{listings.map(x=><article className="notice" key={x.id}><p className="eyebrow">{x.category} · {x.operation}</p><h2>{x.title}</h2><p>{money(x.price)} · {statusLabel[x.status]||x.status}</p>{x.image&&<div className="owner-photo"><Image src={x.image} alt={'Foto de '+x.title} fill unoptimized sizes="180px"/></div>}{x.status==='published'&&<Link href={'/anuncios/'+x.id}>Ver anuncio</Link>}{x.status!=='closed'&&<p><Link href={'/editar/'+x.id}>Editar anuncio</Link></p>}{['pending','paused'].includes(x.status)&&<PhotoUpload id={x.id}/>}<ListingControls id={x.id} status={x.status}/></article>)}</div>:<div className="empty"><h2>Aún no tienes anuncios</h2><p>Publica tu primera oferta en San Julián.</p></div>}</main>;
}
