import Link from 'next/link';
import { notFound } from 'next/navigation';
import { money } from '@/lib/listings';
import { findListing } from '@/lib/repository';
import { currentUser } from '@/lib/auth/server';
import ReportForm from '@/components/report-form';
import ListingGallery from '@/components/listing-gallery';
import ListingMap from '@/components/listing-map';

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
  const user=await currentUser();
  const message=encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" en cachis.net. ¿Sigue disponible?`);
  const whatsapp=`https://wa.me/${listing.whatsapp}?text=${message}`;
  return <main id="contenido" className="container detail"><Link href="/" className="back">← Volver a los anuncios</Link><div className="detail-grid"><div className="detail-content"><ListingGallery photos={listing.photos} title={listing.title}/><section className="detail-description"><h2>Sobre este anuncio</h2><p className="description">{listing.description}</p>{user?.id!==listing.ownerId&&(user?<ReportForm id={listing.id}/>:<p className="report-section"><Link href="/cuenta">Inicia sesión</Link> para reportar un problema con este anuncio.</p>)}</section></div><aside className="detail-panel"><p className="eyebrow">{listing.category} · {listing.operation}</p><h1>{listing.title}</h1><p className="price">{money(listing.price)}{listing.operation==='Alquiler'&&<small> / mes</small>}</p>{listing.operation==='Anticrético'&&<p>Monto del anticrético, no mensualidad.</p>}<p>◎ {listing.zone}, San Julián, Santa Cruz</p><div className="notice"><strong>Publicado por {listing.contactName}</strong></div>{(listing.category==='Lotes'||listing.category==='Casas y departamentos')&&<ListingMap latitude={listing.latitude} longitude={listing.longitude} title={listing.title}/>}<a href={whatsapp} target="_blank" rel="noopener noreferrer" className="button full">Consultar por WhatsApp ↗</a></aside></div></main>;
}
