import Link from 'next/link';
import { notFound } from 'next/navigation';
import LeadWorkspace from '@/components/lead-workspace';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Oportunidades comerciales' };

export default async function LeadsPage() {
  const user = await currentUser();
  if (!user || !isAdmin(user.id)) notFound();
  const sql = database();
  const [rows, listingRows] = await Promise.all([
    sql`SELECT c.id,c.contact_name,c.phone,c.interest,c.source,c.status,c.notes,c.listing_id,c.updated_at,l.title AS listing_title
      FROM cachis.leads c LEFT JOIN cachis.listings l ON l.id=c.listing_id ORDER BY c.updated_at DESC LIMIT 200`,
    sql`SELECT id,title FROM cachis.listings WHERE status='published' ORDER BY created_at DESC LIMIT 100`,
  ]);
  const leads = rows.map(row => ({
    id: String(row.id), contactName: String(row.contact_name), phone: row.phone ? String(row.phone) : null,
    interest: String(row.interest), source: String(row.source), status: String(row.status), notes: String(row.notes),
    listingId: row.listing_id ? String(row.listing_id) : null, listingTitle: row.listing_title ? String(row.listing_title) : null,
    updatedAt: new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'America/La_Paz' }).format(new Date(String(row.updated_at))),
  }));
  const active = leads.filter(lead => !['Cerrado', 'Perdido'].includes(lead.status)).length;
  return <main id="contenido" className="container crm-page">
    <Link href="/administrar" className="back">← Volver a moderación</Link>
    <p className="eyebrow">Panel privado · Cachis Gestión</p><h1>Oportunidades comerciales</h1>
    <p className="lead">Registra cada contacto, acompaña la conversación y actualiza su etapa hasta el cierre.</p>
    <div className="crm-stats"><div><strong>{active}</strong><span>En seguimiento</span></div><div><strong>{leads.filter(lead => lead.status === 'Cerrado').length}</strong><span>Cerradas</span></div><div><strong>{leads.length}</strong><span>Registradas recientes</span></div></div>
    <LeadWorkspace leads={leads} listings={listingRows.map(row => ({ id: String(row.id), title: String(row.title) }))} />
  </main>;
}

