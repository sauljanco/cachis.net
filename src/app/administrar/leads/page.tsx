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
  const [rows, listingRows, totals] = await Promise.all([
    sql`SELECT c.id,c.contact_name,c.phone,c.interest,c.source,c.status,c.notes,c.next_step,c.follow_up_at,c.listing_id,c.updated_at,l.title AS listing_title
      FROM cachis.leads c LEFT JOIN cachis.listings l ON l.id=c.listing_id
      ORDER BY CASE
        WHEN c.status NOT IN ('Cerrado','Perdido') AND c.follow_up_at<=now() THEN 0
        WHEN c.status NOT IN ('Cerrado','Perdido') AND c.follow_up_at IS NOT NULL THEN 1
        WHEN c.status NOT IN ('Cerrado','Perdido') THEN 2 ELSE 3 END,
        c.follow_up_at ASC NULLS LAST,c.updated_at DESC LIMIT 200`,
    sql`SELECT id,title FROM cachis.listings WHERE status='published' ORDER BY created_at DESC LIMIT 100`,
    sql`SELECT count(*)::int AS total,
      count(*) FILTER (WHERE status NOT IN ('Cerrado','Perdido'))::int AS active,
      count(*) FILTER (WHERE status='Cerrado')::int AS closed,
      count(*) FILTER (WHERE status NOT IN ('Cerrado','Perdido') AND follow_up_at<=now())::int AS due
      FROM cachis.leads`,
  ]);
  const now = Date.now();
  const leads = rows.map(row => ({
    id: String(row.id), contactName: String(row.contact_name), phone: row.phone ? String(row.phone) : null,
    interest: String(row.interest), source: String(row.source), status: String(row.status), notes: String(row.notes),
    listingId: row.listing_id ? String(row.listing_id) : null, listingTitle: row.listing_title ? String(row.listing_title) : null,
    nextStep: String(row.next_step), followUpAt: row.follow_up_at ? new Date(String(row.follow_up_at)).toISOString() : null,
    due: Boolean(row.follow_up_at) && !['Cerrado','Perdido'].includes(String(row.status)) && new Date(String(row.follow_up_at)).getTime() <= now,
    updatedAt: new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'America/La_Paz' }).format(new Date(String(row.updated_at))),
  }));
  return <main id="contenido" className="container crm-page">
    <Link href="/administrar" className="back">← Volver a moderación</Link>
    <p className="eyebrow">Panel privado · Cachis Gestión</p><h1>Oportunidades comerciales</h1>
    <p className="lead">Registra cada contacto, acompaña la conversación y actualiza su etapa hasta el cierre.</p>
    <div className="crm-stats"><div><strong>{Number(totals[0].due)}</strong><span>Seguimientos pendientes</span></div><div><strong>{Number(totals[0].active)}</strong><span>En seguimiento</span></div><div><strong>{Number(totals[0].closed)}</strong><span>Cerradas</span></div><div><strong>{Number(totals[0].total)}</strong><span>Total registradas</span></div></div>
    <LeadWorkspace leads={leads} listings={listingRows.map(row => ({ id: String(row.id), title: String(row.title) }))} />
  </main>;
}

