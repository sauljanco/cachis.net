'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { adminManageListing, adminUpdateWhatsapp } from '@/app/actions';

export default function AdminListingControls({ id, status, whatsapp }: { id: string; status: 'published' | 'paused'; whatsapp: string }) {
  const router = useRouter();
  const [number, setNumber] = useState(whatsapp);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function saveNumber() {
    setMessage('');
    startTransition(async () => {
      const result = await adminUpdateWhatsapp(id, number);
      setMessage(result.error || 'Número actualizado.');
      if (!result.error) router.refresh();
    });
  }

  function manage(action: 'pause' | 'resume' | 'delete') {
    if (action === 'delete' && !window.confirm('¿Eliminar este anuncio? Dejará de aparecer en Cachis y no se podrá restaurar desde el panel.')) return;
    setMessage('');
    startTransition(async () => {
      const result = await adminManageListing(id, action);
      if (result.error) setMessage(result.error);
      else router.refresh();
    });
  }

  return <div className="admin-listing-controls">
    <div className="admin-contact-edit">
      <label htmlFor={'admin-whatsapp-' + id}>WhatsApp del anunciante</label>
      <div><input id={'admin-whatsapp-' + id} value={number} inputMode="tel" onChange={event => setNumber(event.target.value)} maxLength={16} disabled={pending} />
        <button type="button" disabled={pending || number === whatsapp} onClick={saveNumber}>Guardar número</button></div>
    </div>
    <div className="admin-listing-actions">
      <button type="button" disabled={pending} onClick={() => manage(status === 'published' ? 'pause' : 'resume')}>{status === 'published' ? 'Pausar anuncio' : 'Volver a publicar'}</button>
      <button className="admin-delete-button" type="button" disabled={pending} onClick={() => manage('delete')}>Eliminar anuncio</button>
    </div>
    <p role="status" aria-live="polite">{message}</p>
  </div>;
}
