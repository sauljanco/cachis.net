import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentUser } from '@/lib/auth/server';
import { ownerListing } from '@/lib/repository';
import ListingForm from '@/components/listing-form';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar anuncio' };

export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) {
    return <main id="contenido" className="container publish-page"><h1>Editar anuncio</h1><p>Inicia sesión para editar tus anuncios.</p><Link href="/cuenta" className="button">Ir a mi cuenta</Link></main>;
  }
  const { id } = await params;
  const listing = await ownerListing(id, user.id);
  if (!listing || listing.status === 'closed') notFound();

  const initialDraft = {
    title: listing.title,
    category: listing.category,
    operation: listing.operation,
    price: String(listing.price),
    currency: listing.currency,
    zone: listing.zone,
    description: listing.description,
    contactName: listing.contactName,
    whatsapp: listing.whatsapp,
    latitude: listing.latitude === null ? '' : String(listing.latitude),
    longitude: listing.longitude === null ? '' : String(listing.longitude),
  };
  return <main id="contenido" className="container publish-page"><Link href="/mis-anuncios" className="back">← Volver a mis anuncios</Link><h1>Editar anuncio</h1><p className="lead">Actualiza la información de tu oferta en San Julián.</p><div className="notice"><strong>Revisaremos los cambios antes de mostrarlos.</strong><p>Si el anuncio ya estaba publicado, dejará de aparecer hasta que se apruebe de nuevo.</p></div><ListingForm id={id} initialDraft={initialDraft} initialPhotoCount={listing.photoCount}/></main>;
}
