import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { money } from '@/lib/listings';
import { findListing } from '@/lib/repository';
import { listingJsonLd } from '@/lib/seo';
import { currentUser } from '@/lib/auth/server';
import ReportForm from '@/components/report-form';
import ListingGallery from '@/components/listing-gallery';
import ListingMap from '@/components/listing-map';
import ViewCounter from '@/components/view-counter';

export const dynamic = 'force-dynamic';
type Props = {params:Promise<{id:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {id}=await params;
  const listing=await findListing(id);
  if (!listing) notFound();

  const url=`https://cachis.net/anuncios/${listing.id}`;
  const price=money(listing.price,listing.currency);
  const summary=listing.description.replace(/\s+/g,' ').trim().slice(0,150);
  const description=`${price} · ${listing.category} en ${listing.operation.toLowerCase()} · ${listing.zone}, San Julián, Santa Cruz.${summary ? ` ${summary}` : ''}`;
  const image=listing.photos[0]
    ? {url:`https://cachis.net${listing.photos[0]}/social?v=3`,width:1200,height:630,alt:`Fotografía de ${listing.title} con la marca cachis.net`,type:'image/jpeg'}
    : {url:'https://cachis.net/brand-logo.png',alt:'cachis.net'};

  return {
    title:listing.title,
    description,
    alternates:{canonical:url},
    robots:{index:true,follow:true},
    openGraph:{type:'website',locale:'es_BO',siteName:'cachis.net',url,title:listing.title,description,images:[image]},
    twitter:{card:'summary_large_image',title:listing.title,description,images:[image.url]},
  };
}
export default async function Detail({params}:Props) {
  const {id}=await params;
  const listing=await findListing(id);
  if (!listing) notFound();
  const user=await currentUser();
  const message=encodeURIComponent(`Hola, vi tu anuncio "${listing.title}" en cachis.net. ¿Sigue disponible?`);
  const whatsapp=`https://wa.me/${listing.whatsapp}?text=${message}`;
  return <main id="contenido" className="container detail">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(listingJsonLd(listing)).replace(/</g,'\\u003c')}} />
    <nav className="detail-breadcrumb" aria-label="Ruta de navegación"><Link href="/" className="back"><span aria-hidden="true">←</span> Explorar anuncios</Link><span aria-hidden="true" className="breadcrumb-separator">/</span><span>{listing.category}</span></nav>
    <div className="detail-grid">
      <aside className="detail-panel">
        <div className="detail-summary">
          <p className="eyebrow">{listing.category} · {listing.operation}</p>
          <h1>{listing.title}</h1>
          <p className="price">{money(listing.price,listing.currency)}{listing.operation==='Alquiler'&&<small> / mes</small>}</p>
          {listing.operation==='Anticrético'&&<p>Monto del anticrético, no mensualidad.</p>}
          <p className="detail-zone">◎ {listing.zone}, San Julián, Santa Cruz</p><ViewCounter kind="listing" id={listing.id} initialCount={listing.views} className="detail-views" />
        </div>
        <div className="detail-contact">
          <div className="notice"><strong>Publicado por {listing.contactName}</strong></div>
          {(['Lotes','Terrenos y parcelas','Casas y departamentos'].includes(listing.category))&&<ListingMap latitude={listing.latitude} longitude={listing.longitude} title={listing.title}/>}
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="button full detail-whatsapp">Consultar por WhatsApp ↗</a>
        </div>
      </aside>
      <div className="detail-content">
        <ListingGallery photos={listing.photos} title={listing.title}/>
        <section className="detail-description">
          <p className="section-kicker">INFORMACIÓN DEL ANUNCIO</p>
          <h2>Sobre este anuncio</h2>
          <p className="description">{listing.description}</p>
          <dl className="listing-specs">
            <div><dt>Tipo</dt><dd>{listing.category}</dd></div>
            <div><dt>Operación</dt><dd>{listing.operation}</dd></div>
            <div><dt>Ubicación</dt><dd>{listing.zone}, San Julián</dd></div>
            <div><dt>Moneda</dt><dd>{listing.currency === 'BOB' ? 'Bolivianos (Bs)' : 'Dólares (US$)'}</dd></div>
          </dl>
          {user?.id!==listing.ownerId&&(user?<details className="report-disclosure"><summary>Reportar un problema con este anuncio</summary><ReportForm id={listing.id}/></details>:<p className="report-section"><Link href="/cuenta">Inicia sesión</Link> para reportar un problema con este anuncio.</p>)}
        </section>
      </div>
    </div>
  </main>;
}
