'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createLead } from '@/app/administrar/leads/actions';

const stages = ['Nuevo', 'Contactado', 'Calificado', 'Visita/demo', 'Negociación', 'Cerrado', 'Perdido'] as const;
type Lead = { id: string; contactName: string; phone: string | null; interest: string; source: string; status: string; notes: string; nextStep: string; followUpAt: string | null; due: boolean; listingId: string | null; listingTitle: string | null; updatedAt: string };
type Listing = { id: string; title: string };

function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function followUpValue(formData: FormData) {
  const value = String(formData.get('followUpAt') || '');
  return value ? new Date(value + ':00-04:00').toISOString() : '';
}
function followUpLabel(value: string) {
  return new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/La_Paz' }).format(new Date(value));
}

export default function LeadWorkspace({ leads, listings }: { leads: Lead[]; listings: Listing[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Activos');
  const [view, setView] = useState<'pipeline' | 'lista'>('pipeline');

  function add(formData: FormData) {
    setMessage('');
    startTransition(async () => {
      try {
        const result = await createLead({
          contactName: formData.get('contactName'), phone: formData.get('phone'),
          interest: formData.get('interest'), source: formData.get('source'),
          listingId: formData.get('listingId'), notes: formData.get('notes'),
          nextStep: formData.get('nextStep'), followUpAt: followUpValue(formData),
        });
        if (result.error) setMessage(result.error);
        else if (result.id) router.push(`/administrar/crm/${result.id}`);
      } catch { setMessage('No pudimos registrar el contacto. Intenta de nuevo.'); }
    });
  }

  const term = normalize(query.trim());
  const visible = leads.filter(lead => {
    const matchesText = !term || normalize([lead.contactName, lead.phone, lead.interest, lead.listingTitle].filter(Boolean).join(' ')).includes(term);
    const matchesStage = filter === 'Todos' || (filter === 'Activos' ? !['Cerrado', 'Perdido'].includes(lead.status) : filter === 'Pendientes' ? lead.due : lead.status === filter);
    return matchesText && matchesStage;
  });

  return <>
    <section className="crm-workspace" aria-labelledby="crm-portfolio">
      <div className="crm-section-heading"><div><p className="eyebrow">Cartera de contactos</p><h2 id="crm-portfolio">Negocios en seguimiento</h2></div><span className="crm-result-count">{visible.length} de {leads.length}</span></div>
      <div className="crm-toolbar">
        <label className="crm-search">Buscar contacto, teléfono o anuncio<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ej.: lote, Saúl, 5917…" /></label>
        <label className="crm-stage-filter">Mostrar<select value={filter} onChange={event => setFilter(event.target.value)}><option>Activos</option><option>Pendientes</option><option>Todos</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select></label>
        <div className="crm-view-switch" role="group" aria-label="Vista del CRM"><button type="button" aria-pressed={view === 'pipeline'} onClick={() => setView('pipeline')}>Etapas</button><button type="button" aria-pressed={view === 'lista'} onClick={() => setView('lista')}>Lista</button></div>
      </div>
      {visible.length === 0 ? <div className="crm-empty"><strong>No hay contactos en esta vista.</strong><p>Prueba otro filtro o registra un contacto nuevo.</p></div> : view === 'pipeline' ?
        <div className="crm-pipeline" aria-label="Contactos por etapa">{stages.filter(stage => filter === 'Todos' || filter === stage || (filter === 'Activos' || filter === 'Pendientes') && !['Cerrado', 'Perdido'].includes(stage)).map(stage => {
          const items = visible.filter(lead => lead.status === stage);
          return <section className="crm-column" key={stage} aria-label={`${stage}: ${items.length} contactos`}><div className="crm-column-heading"><h3>{stage}</h3><span>{items.length}</span></div><div className="crm-column-items">{items.length ? items.map(lead => <LeadCard key={lead.id} lead={lead} />) : <p className="crm-column-empty">Sin contactos</p>}</div></section>;
        })}</div> :
        <div className="crm-list-view">{visible.map(lead => <LeadCard key={lead.id} lead={lead} />)}</div>}
    </section>
    <section id="nuevo-contacto" className="crm-panel crm-new-contact" aria-labelledby="new-lead"><p className="eyebrow">Alta manual</p><h2 id="new-lead">Nuevo contacto</h2><p className="lead">Registra interesados que te escriben por WhatsApp, Facebook o llegan en persona. Sus datos solo aparecen en el CRM privado.</p>
      <form id="lead-form" action={add} className="form-grid">
        <label>Nombre del contacto<input name="contactName" minLength={2} maxLength={80} required /></label>
        <label>Teléfono (opcional)<input name="phone" inputMode="tel" pattern="591[67][0-9]{7}" placeholder="5917XXXXXXX" /></label>
        <label className="wide">Qué busca o qué ofrece<input name="interest" minLength={5} maxLength={300} required /></label>
        <label>Origen<select name="source"><option>WhatsApp</option><option>Facebook</option><option>Presencial</option><option>Otro</option></select></label>
        <label>Anuncio relacionado (opcional)<select name="listingId"><option value="">Sin anuncio</option>{listings.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
        <label className="wide">Próximo paso (completa también la fecha)<input name="nextStep" maxLength={300} placeholder="Ej.: llamar para coordinar visita" /></label>
        <label>Fecha y hora del seguimiento<input name="followUpAt" type="datetime-local" /></label>
        <label className="wide">Nota interna (opcional)<textarea name="notes" rows={3} maxLength={1000} /></label>
        <div className="wide"><button className="button" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar contacto'}</button><p className="form-status" role="status">{message}</p></div>
      </form>
    </section>
  </>;
}

function LeadCard({ lead }: { lead: Lead }) {
  return <article className={lead.due ? 'crm-lead-card crm-lead-due' : 'crm-lead-card'}>
    <div className="crm-lead-top"><span className="crm-lead-avatar" aria-hidden="true">{lead.contactName.charAt(0).toLocaleUpperCase('es')}</span><span className="crm-source">{lead.source}</span></div>
    <h4><Link href={`/administrar/crm/${lead.id}`}>{lead.contactName}</Link></h4>
    <p className="crm-lead-interest">{lead.interest}</p>
    {lead.listingTitle && <p className="crm-lead-listing">Anuncio: {lead.listingTitle}</p>}
    {lead.followUpAt && <p className={lead.due ? 'crm-follow-up crm-follow-up-due' : 'crm-follow-up'}><strong>{lead.due ? 'Atender ahora' : 'Próximo paso'}</strong><br />{lead.nextStep}<br />{followUpLabel(lead.followUpAt)}</p>}
    <div className="crm-lead-foot"><span>{lead.status}</span><Link href={`/administrar/crm/${lead.id}`} aria-label={`Abrir ficha de ${lead.contactName}`}>Abrir ficha →</Link></div>
  </article>;
}
