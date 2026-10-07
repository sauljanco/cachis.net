import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';
import ModerationControls from '@/components/moderation-controls';
import ReportActions from '@/components/report-actions';

export const dynamic='force-dynamic';
export const metadata={title:'Moderación'};
export default async function AdminPage(){
  const user=await currentUser();
  if(!user||!isAdmin(user.id))notFound();
  const sql=database();
  const [rows,reports]=await Promise.all([
    sql`SELECT l.id,l.title,l.category,l.operation,l.price,l.zone,l.description,l.contact_name,l.created_at,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id FROM cachis.listings l WHERE l.status='pending' ORDER BY l.created_at ASC LIMIT 100`,
    sql`SELECT r.id,r.reason,r.created_at,l.id AS listing_id,l.title,l.status FROM cachis.reports r JOIN cachis.listings l ON l.id=r.listing_id WHERE r.resolved_at IS NULL ORDER BY r.created_at ASC LIMIT 100`,
  ]);
  return <main id="contenido" className="container publish-page"><h1>Anuncios por revisar</h1><p><Link className="button small" href="/administrar/leads">Oportunidades comerciales →</Link></p><p>{rows.length} pendientes</p>{rows.map(row=><article className="notice" key={String(row.id)}><p className="eyebrow">{String(row.category)} · {String(row.operation)}</p><h2>{String(row.title)}</h2>{row.photo_id&&<div className="owner-photo"><Image src={'/api/fotos/'+String(row.photo_id)} alt={'Foto de '+String(row.title)} fill unoptimized sizes="180px"/></div>}<p>Bs {String(row.price)} · {String(row.zone)} · {String(row.contact_name)}</p><p>{String(row.description)}</p><ModerationControls id={String(row.id)}/></article>)}<h2>Reportes de usuarios</h2><p>{reports.length} sin revisar</p>{reports.map(row=><article className="notice" key={String(row.id)}><p className="eyebrow">Anuncio {String(row.status)}</p><h3>{String(row.title)}</h3><p>{String(row.reason)}</p>{row.status==='published'&&<p><Link href={'/anuncios/'+String(row.listing_id)} target="_blank" rel="noopener noreferrer">Ver anuncio ↗</Link></p>}<ReportActions id={String(row.id)} published={row.status==='published'}/></article>)}</main>;
}
