'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { addLeadActivity, updateLead } from '@/app/administrar/leads/actions';

const statuses = ['Nuevo', 'Contactado', 'Calificado', 'Visita/demo', 'Negociación', 'Cerrado', 'Perdido'];
type Lead = { id: string; status: string; notes: string; nextStep: string; followUpAt: string | null };
function localDateTime(iso: string | null) {
  if (!iso) return '';
  return new Date(new Date(iso).getTime() - 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
function followUpValue(formData: FormData) {
  const value = String(formData.get('followUpAt') || '');
  return value ? new Date(value + ':00-04:00').toISOString() : '';
}

export default function LeadDetailControls({ lead }: { lead: Lead }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState('');
  const [activityMessage, setActivityMessage] = useState('');

  function save(formData: FormData) {
    setSaveMessage('');
    startTransition(async () => {
      try {
        const result = await updateLead(lead.id, { status: formData.get('status'), notes: formData.get('notes'), nextStep: formData.get('nextStep'), followUpAt: followUpValue(formData) });
        if (result.error) setSaveMessage(result.error);
        else { setSaveMessage('Cambios guardados.'); router.refresh(); }
      } catch { setSaveMessage('No pudimos guardar los cambios.'); }
    });
  }

  function log(formData: FormData) {
    setActivityMessage('');
    startTransition(async () => {
      try {
        const result = await addLeadActivity(lead.id, { kind: formData.get('kind'), detail: formData.get('detail') });
        if (result.error) setActivityMessage(result.error);
        else { (document.getElementById('crm-activity-form') as HTMLFormElement | null)?.reset(); setActivityMessage('Gestión registrada.'); router.refresh(); }
      } catch { setActivityMessage('No pudimos registrar la gestión.'); }
    });
  }

  return <>
    <section className="crm-panel crm-contact-editor"><h2>Etapa y siguiente paso</h2><form action={save} className="crm-card-form">
      <label>Etapa del negocio<select name="status" defaultValue={lead.status}>{statuses.map(status => <option key={status}>{status}</option>)}</select></label>
      <label>Próximo paso<input name="nextStep" maxLength={300} defaultValue={lead.nextStep} placeholder="Ej.: confirmar visita" /></label>
      <label>Fecha y hora<input name="followUpAt" type="datetime-local" defaultValue={localDateTime(lead.followUpAt)} /></label>
      <label>Nota interna actual<textarea name="notes" rows={3} maxLength={1000} defaultValue={lead.notes} placeholder="Contexto importante de esta negociación" /></label>
      <p className="crm-form-hint">Al cerrar o marcar como perdido se elimina el próximo seguimiento. Si se perdió, anota el motivo.</p>
      <button className="button small" type="submit" disabled={pending}>Guardar cambios</button><p role="status" className="form-status">{saveMessage}</p>
    </form></section>
    <section className="crm-panel crm-contact-editor"><h2>Registrar gestión</h2><p className="lead">Guarda lo que conversaste para no perder el contexto.</p><form id="crm-activity-form" action={log} className="crm-card-form">
      <label>Tipo de gestión<select name="kind"><option>Nota</option><option>Llamada</option><option>WhatsApp</option><option>Visita</option><option>Correo</option></select></label>
      <label>Resumen<textarea name="detail" rows={4} minLength={3} maxLength={1000} required placeholder="Ej.: solicitó fotos y acordamos llamar el viernes" /></label>
      <button className="button small" type="submit" disabled={pending}>Agregar al historial</button><p role="status" className="form-status">{activityMessage}</p>
    </form></section>
  </>;
}
