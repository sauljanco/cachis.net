import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { money } from '@/lib/listings';
import { findListing } from '@/lib/repository';

export const dynamic = 'force-dynamic';
type Props = {params:Promise<{id:string}>};
export async function generateMetadata({params}:Props) {
  const {id}=await params;
  const listing=await findListing(id);
  return {title:listing?.title||'Anuncio no encontrado'};
}
export default async function Detail({params}:Props) {
  const {id}=await params;
  const listing=await findListing(id);
  if (!listing) notFound();
  const message=encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" en cachis.net. ¿Sigue disponible?`);
  const whatsapp=`https://wa.me/${listing.whatsapp}?text=${message}`;
  return <main id="contenido" className="container detail"><Link href="/" className="back">← Volver a los anuncios</Link><div className="detail-grid"><div><div className="detail-photo photo-placeholder">{listing.image?<Image src={listing.image} alt={'Foto de '+listing.title} fill unoptimized sizes="(max-width: 800px) 100vw, 65vw"/>:'Fotografías próximamente'}</div><h2>Sobre este anuncio</h2><p className="description">{listing.description}</p></div><aside className="detail-panel"><p className="eyebrow">{listing.category} · {listing.operation}</p><h1>{listing.title}</h1><p className="price">{money(listing.price)}{listing.operation==='Alquiler'&&<small> / mes</small>}</p>{listing.operation==='Anticrético'&&<p>Monto del anticrético, no mensualidad.</p>}<p>◎ {listing.zone}, San Julián, Santa Cruz</p><div className="notice"><strong>Publicado por {listing.contactName}</strong><p>Confirma disponibilidad, documentación y condiciones directamente con el anunciante.</p></div><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="button full">Consultar por WhatsApp ↗</a></aside></div></main>;
}
