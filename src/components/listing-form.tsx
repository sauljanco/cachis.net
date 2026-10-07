'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { submitListing, updateListing } from '@/app/actions';
import PropertyMapPicker from '@/components/property-map-picker';

const initial = {
  title: '', category: 'Motos', operation: 'Venta', price: '', currency: 'BOB',
  zone: '', description: '', contactName: '', whatsapp: '', latitude: '', longitude: '',
};
type ListingDraft = typeof initial;

export default function ListingForm({ id, initialDraft }: { id?: string; initialDraft?: ListingDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft ?? initial);
  const [status, setStatus] = useState('');
  const [pending, startTransition] = useTransition();

  function change(key: keyof ListingDraft, value: string) {
    setDraft(current => ({
      ...current,
      [key]: value,
      ...(key === 'category' && value !== 'Casas y departamentos' ? { operation: 'Venta' } : {}),
      ...(key === 'category' && value !== 'Lotes' && value !== 'Casas y departamentos' ? { latitude: '', longitude: '' } : {}),
    }));
    setStatus('');
  }

  const isHome = draft.category === 'Casas y departamentos';
  const hasPropertyMap = draft.category === 'Lotes' || isHome;
  const priceLabel = draft.operation === 'Alquiler' ? 'Mensualidad' : draft.operation === 'Anticrético' ? 'Monto del anticrético' : 'Precio';

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      try {
        const result = id ? await updateListing(id, draft) : await submitListing(draft);
        if (('id' in result && result.id) || ('success' in result && result.success)) {
          router.push('/mis-anuncios');
          return;
        }
        setStatus(result.error || 'No se pudo enviar el anuncio.');
      } catch {
        setStatus('No pudimos conectar con el servidor. Intenta de nuevo.');
      }
    });
  }

  return <form className="draft-form" onSubmit={submit}>
    <div className="form-grid">
      <label className="wide">Título del anuncio<input required minLength={8} maxLength={100} value={draft.title} onChange={e => change('title', e.target.value)} placeholder="Ej.: Moto de trabajo en buen estado" /></label>
      <label>Categoría<select value={draft.category} onChange={e => change('category', e.target.value)}><option>Motos</option><option>Vehículos</option><option>Lotes</option><option>Casas y departamentos</option><option>Electrónicos</option><option>Otros</option></select></label>
      <label>Operación<select value={draft.operation} onChange={e => change('operation', e.target.value)}><option>Venta</option>{isHome && <><option>Alquiler</option><option>Anticrético</option></>}</select></label>
      <div className="wide price-fields">
        <label>{priceLabel}<input type="number" min="1" max="999999999" step="0.01" required value={draft.price} onChange={e => change('price', e.target.value)} placeholder="0" /></label>
        <label>Moneda<select value={draft.currency} onChange={e => change('currency', e.target.value)}><option value="BOB">Bolivianos (Bs)</option><option value="USD">Dólares (US$)</option></select></label>
      </div>
      <label>Barrio, zona o comunidad<input required minLength={2} maxLength={100} value={draft.zone} onChange={e => change('zone', e.target.value)} placeholder="Dentro de San Julián" /></label>
      <label className="wide">Descripción<textarea required minLength={20} maxLength={3000} rows={5} value={draft.description} onChange={e => change('description', e.target.value)} placeholder="Describe su estado, características y condiciones." /></label>
      {hasPropertyMap && <PropertyMapPicker latitude={draft.latitude} longitude={draft.longitude} onChange={(latitude, longitude) => { setDraft(current => ({ ...current, latitude, longitude })); setStatus(''); }} />}
      <label>Tu nombre o nombre comercial<input required minLength={2} maxLength={80} value={draft.contactName} onChange={e => change('contactName', e.target.value)} /></label>
      <label>WhatsApp de Bolivia<input required inputMode="tel" minLength={8} value={draft.whatsapp} onChange={e => change('whatsapp', e.target.value)} placeholder="Ej.: 7XXXXXXX" /></label>
    </div>
    <p className="muted">{id ? 'Los cambios quedarán en revisión. Si el anuncio estaba publicado, dejará de verse hasta que lo aprobemos de nuevo.' : 'Tu número será visible en el anuncio aprobado para que te contacten. Tras enviarlo, podrás subir hasta 3 fotos en «Mis anuncios».'}</p>
    <button className="button" type="submit" disabled={pending}>{pending ? 'Enviando…' : id ? 'Guardar y enviar a revisión' : 'Enviar para revisión'}</button>
    <p className="form-status" role="status">{status}</p>
  </form>;
}
