import Link from 'next/link';
import { notFound } from 'next/navigation';
import LeadDetailControls from '@/components/lead-detail-controls';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { database } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Ficha de contacto · CRM' };
type Props = { params: Promise<{ id: string }> };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const date = (value: unknown) => new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/La_Paz' }).format(new Date(String(value)));

export default async function CrmContactPage({ params }: Props) {
  const user = await currentUser();
  if (!user || !isAdmin(user.id)) notFound();
  const { id } = await params;
  if (!uuid.test(id)) notFound();
  const sql = database();
  const [rows, activityRows] = await Promise.all([
    sql`SELECT c.*,l.title AS listing_title FROM cachis.leads c LEFT JOIN cachis.listings l ON l.id=c.listing_id WHERE c.id=${id}`,
    sql`SELECT id,kind,detail,created_at FROM cachis.lead_activities WHERE lead_id=${id} ORDER BY created_at DESC LIMIT 100`,
  ]);
  const lead = rows[0];
  if (!lead) notFound();
  const phone = lead.phone ? String(lead.phone) : null;
  const closed = ['Cerrado', 'Perdido'].includes(String(lead.status));
  const due = !closed && Boolean(lead.follow_up_at) && new Date(String(lead.follow_up_at)).getTime() <= Date.now();
  return <main id="contenido" className="container crm-page crm-contact-page">
    <Link href="/administrar/crm" className="back">← Volver al CRM</Link>
    <div className="crm-contact-heading"><span className="crm-contact-avatar" aria-hidden="true">{String(lead.contact_name).charAt(0).toLocaleUpperCase('es')}</span><div><p className="eyebrow">Ficha de contacto · {String(lead.source)}</p><h1>{String(lead.contact_name)}</h1><p className="lead">{String(lead.interest)}</p></div><span className={due ? 'crm-status crm-due' : 'crm-status'}>{due ? 'Seguimiento vencido' : String(lead.status)}</span></div>
    <div className="crm-contact-grid"><div>
      <section className="crm-panel crm-contact-summary"><h2>Información</h2><dl><div><dt>Teléfono</dt><dd>{phone ? <><a href={`tel:+${phone}`}>+{phone}</a><a className="crm-whatsapp" href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">Abrir WhatsApp ↗</a></> : 'No registrado'}</dd></div><div><dt>Origen</dt><dd>{String(lead.source)}</dd></div><div><dt>Anuncio relacionado</dt><dd>{lead.listing_id ? <Link href={`/anuncios/${lead.listing_id}`} target="_blank" rel="noopener noreferrer">{String(lead.listing_title ?? 'Ver anuncio')} ↗</Link> : 'Sin anuncio'}</dd></div><div><dt>Creado</dt><dd>{date(lead.created_at)}</dd></div></dl></section>
      <section className="crm-panel crm-timeline"><h2>Historial de gestiones</h2>{activityRows.length ? <ol>{activityRows.map(item => <li key={String(item.id)}><span className="crm-timeline-dot" aria-hidden="true"/><div><div className="crm-timeline-heading"><strong>{String(item.kind)}</strong><time dateTime={new Date(String(item.created_at)).toISOString()}>{date(item.created_at)}</time></div><p>{String(item.detail)}</p></div></li>)}</ol> : <p className="lead">Todavía no se registraron gestiones. Agrega una nota, llamada o visita para comenzar el historial.</p>}</section>
    </div><aside><LeadDetailControls lead={{ id, status: String(lead.status), notes: String(lead.notes), nextStep: String(lead.next_step), followUpAt: lead.follow_up_at ? new Date(String(lead.follow_up_at)).toISOString() : null }} /></aside></div>
  </main>;
}
