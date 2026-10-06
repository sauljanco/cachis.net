'use client';

import { useState, useTransition } from 'react';
import { reportListing } from '@/app/actions';

export default function ReportForm({ id }: { id: string }) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = await reportListing(id, reason);
        if (result.error) setMessage(result.error);
        else { setSent(true); setMessage('Reporte enviado. Revisaremos este anuncio.'); }
      } catch {
        setMessage('No pudimos enviar el reporte. Intenta de nuevo.');
      }
    });
  }

  return <section className="report-section" aria-label="Reportar anuncio">
    <h2>¿Hay un problema con este anuncio?</h2>
    <p>Cuéntanos qué ocurre. Un reporte no retira el anuncio automáticamente.</p>
    {sent ? <p role="status">{message}</p> : <form onSubmit={submit}>
      <label htmlFor="report-reason">Motivo del reporte</label>
      <textarea id="report-reason" value={reason} onChange={event => { setReason(event.target.value); setMessage(''); }} required minLength={10} maxLength={500} rows={3} placeholder="Ej.: La descripción no coincide con las fotos." />
      <button className="text-button" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar reporte'}</button>
      <p role="status">{message}</p>
    </form>}
  </section>;
}
