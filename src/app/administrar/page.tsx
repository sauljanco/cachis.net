import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';
import { siteViewCount } from '@/lib/view-counts';
import ModerationControls from '@/components/moderation-controls';
import AdminListingControls from '@/components/admin-listing-controls';
import ReportActions from '@/components/report-actions';
import { money, type Currency } from '@/lib/listings';

export const dynamic='force-dynamic';
export const metadata={title:'Moderación'};
export default async function AdminPage(){
  const user=await currentUser();
  if(!user||!isAdmin(user.id))notFound();
  const sql=database();
  const [rows,active,reports,siteViews]=await Promise.all([
    sql`SELECT l.id,l.title,l.category,l.operation,l.price,l.currency,l.zone,l.description,l.contact_name,l.created_at,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id FROM cachis.listings l WHERE l.status='pending' ORDER BY l.created_at ASC LIMIT 100`,
    sql`SELECT l.id,l.title,l.category,l.price,l.currency,l.zone,l.contact_name,l.whatsapp,l.status,l.created_at,(SELECT p.id FROM cachis.listing_photos p WHERE p.listing_id=l.id ORDER BY p.position LIMIT 1) AS photo_id
      FROM cachis.listings l WHERE l.status IN ('published','paused') ORDER BY l.created_at DESC LIMIT 100`,
    sql`SELECT r.id,r.reason,r.created_at,l.id AS listing_id,l.title,l.status FROM cachis.reports r JOIN cachis.listings l ON l.id=r.listing_id WHERE r.resolved_at IS NULL AND l.status<>'deleted' ORDER BY r.created_at ASC LIMIT 100`,
    siteViewCount(),
  ]);
  return <main id="contenido" className="container publish-page"><h1>Anuncios por revisar</h1><p className="admin-site-stats">{new Intl.NumberFormat('es-BO').format(siteViews)} visualizaciones de la portada</p><p><Link className="button small" href="/administrar/crm">CRM de Cachis →</Link></p><p>{rows.length} pendientes</p>{rows.map(row=><article className="notice" key={String(row.id)}><p className="eyebrow">{String(row.category)} · {String(row.operation)}</p><h2>{String(row.title)}</h2>{row.photo_id&&<div className="owner-photo"><Image src={'/api/fotos/'+String(row.photo_id)} alt={'Foto de '+String(row.title)} fill unoptimized sizes="180px"/></div>}<p>{money(Number(row.price),row.currency as Currency)} · {String(row.zone)} · {String(row.contact_name)}</p><p>{String(row.description)}</p><ModerationControls id={String(row.id)} hasPhoto={Boolean(row.photo_id)}/></article>)}<section className="admin-active-section"><div className="admin-section-title"><div><p className="eyebrow">GESTIÓN DE PUBLICACIONES</p><h2>Anuncios publicados y pausados</h2></div><span>{active.length} anuncios</span></div>{active.length ? <div className="admin-active-list">{active.map(row=><article className="admin-active-card" key={String(row.id)}><div className="admin-active-main">{row.photo_id&&<div className="admin-active-photo"><Image src={'/api/fotos/'+String(row.photo_id)} alt={'Foto de '+String(row.title)} fill unoptimized sizes="96px"/></div>}<div><span className={'admin-status admin-status-'+String(row.status)}>{row.status==='published'?'Publicado':'Pausado'}</span><h3>{String(row.title)}</h3><p>{String(row.category)} · {money(Number(row.price),row.currency as Currency)} · {String(row.zone)}</p><small>Por {String(row.contact_name)} · {String(row.id).slice(0,8)}</small></div></div><AdminListingControls id={String(row.id)} status={row.status as 'published' | 'paused'} whatsapp={String(row.whatsapp)}/></article>)}</div> : <p>No hay anuncios publicados ni pausados.</p>}</section><h2>Reportes de usuarios</h2><p>{reports.length} sin revisar</p>{reports.map(row=><article className="notice" key={String(row.id)}><p className="eyebrow">Anuncio {String(row.status)}</p><h3>{String(row.title)}</h3><p>{String(row.reason)}</p>{row.status==='published'&&<p><Link href={'/anuncios/'+String(row.listing_id)} target="_blank" rel="noopener noreferrer">Ver anuncio ↗</Link></p>}<ReportActions id={String(row.id)} published={row.status==='published'}/></article>)}</main>;
}
