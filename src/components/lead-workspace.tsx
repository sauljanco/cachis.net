'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createLead, updateLead } from '@/app/administrar/leads/actions';

const statuses = ['Nuevo', 'Contactado', 'Calificado', 'Visita/demo', 'Negociación', 'Cerrado', 'Perdido'] as const;
type Lead = { id: string; contactName: string; phone: string | null; interest: string; source: string; status: string; notes: string; listingId: string | null; listingTitle: string | null; updatedAt: string };
type Listing = { id: string; title: string };

export default function LeadWorkspace({ leads, listings }: { leads: Lead[]; listings: Listing[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('Activas');

  function add(formData: FormData) {
    setMessage('');
    startTransition(async () => {
      try {
        const result = await createLead({
          contactName: formData.get('contactName'), phone: formData.get('phone'),
          interest: formData.get('interest'), source: formData.get('source'),
          listingId: formData.get('listingId'), notes: formData.get('notes'),
        });
        if (result.error) setMessage(result.error);
        else { (document.getElementById('lead-form') as HTMLFormElement | null)?.reset(); setMessage('Oportunidad registrada.'); router.refresh(); }
      } catch { setMessage('No pudimos registrar la oportunidad. Intenta de nuevo.'); }
    });
  }

  const visible = leads.filter(lead => filter === 'Todas' || (filter === 'Activas' ? !['Cerrado', 'Perdido'].includes(lead.status) : lead.status === filter));
  return <>
    <section className="crm-panel" aria-labelledby="new-lead"><h2 id="new-lead">Registrar oportunidad</h2><p className="lead">Para contactos recibidos por WhatsApp, Facebook o en persona. Solo la administración puede consultar estos datos.</p>
      <form id="lead-form" action={add} className="form-grid">
        <label>Nombre del contacto<input name="contactName" minLength={2} maxLength={80} required /></label>
        <label>Teléfono (opcional)<input name="phone" inputMode="tel" pattern="591[67][0-9]{7}" placeholder="5917XXXXXXX" /></label>
        <label className="wide">Qué busca o qué ofrece<input name="interest" minLength={5} maxLength={300} required /></label>
        <label>Origen<select name="source"><option>WhatsApp</option><option>Facebook</option><option>Presencial</option><option>Otro</option></select></label>
        <label>Anuncio relacionado (opcional)<select name="listingId"><option value="">Sin anuncio</option>{listings.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="wide">Nota interna (opcional)<textarea name="notes" rows={3} maxLength={1000} /></label>
        <div className="wide"><button className="button" type="submit" disabled={pending}>Guardar oportunidad</button><p className="form-status" role="status">{message}</p></div>
      </form>
    </section>
    <section aria-labelledby="lead-list"><div className="crm-list-heading"><h2 id="lead-list">Seguimiento</h2><label>Mostrar <select value={filter} onChange={event => setFilter(event.target.value)}><option>Activas</option><option>Todas</option>{statuses.map(status => <option key={status}>{status}</option>)}</select></label></div>
      {visible.length === 0 && <p className="notice">No hay oportunidades en esta vista.</p>}
      <div className="crm-list">{visible.map(lead => <LeadCard key={lead.id} lead={lead} onSaved={() => router.refresh()} />)}</div>
    </section>
  </>;
}

function LeadCard({ lead, onSaved }: { lead: Lead; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  function save(formData: FormData) {
    setMessage('');
    startTransition(async () => {
      try {
        const result = await updateLead(lead.id, { status: formData.get('status'), notes: formData.get('notes') });
        if (result.error) setMessage(result.error);
        else { setMessage('Guardado.'); onSaved(); }
      } catch { setMessage('No pudimos actualizar esta oportunidad.'); }
    });
  }
  return <article className="crm-card"><div className="crm-card-top"><div><span className="crm-source">{lead.source}</span><h3>{lead.contactName}</h3></div><span className="crm-status">{lead.status}</span></div>
    <p>{lead.interest}</p>{lead.phone && <p><a href={'tel:+' + lead.phone}>+{lead.phone}</a></p>}
    {lead.listingId && <p><a href={'/anuncios/' + lead.listingId} target="_blank" rel="noopener noreferrer">{lead.listingTitle || 'Ver anuncio'} ↗</a></p>}
    <form action={save} className="crm-card-form"><label>Etapa<select name="status" defaultValue={lead.status}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label><label>Nota interna<textarea name="notes" rows={2} maxLength={1000} defaultValue={lead.notes} /></label><button className="button small" type="submit" disabled={pending}>Actualizar</button><span role="status">{message}</span></form>
    <small>Actualizado: {lead.updatedAt}</small>
  </article>;
}
