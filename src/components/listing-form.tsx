'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { submitListing, updateListing } from '@/app/actions';
import PropertyMapPicker from '@/components/property-map-picker';

const initial = {
  title: '', category: 'Motos', operation: 'Venta', price: '', currency: 'BOB',
  zone: '', description: '', contactName: '', whatsapp: '', latitude: '', longitude: '',
};
type ListingDraft = typeof initial;
const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function PhotoSelector({ files, existingCount, uploadedCount, disabled, onChoose, onRemove }: {
  files: File[];
  existingCount: number;
  uploadedCount: number;
  disabled: boolean;
  onChoose: (files: File[]) => void;
  onRemove: (index: number) => void;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => {
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);
  const total = existingCount + uploadedCount + files.length;

  return <div className="wide listing-photo-picker">
    <div className="listing-photo-heading"><strong>Fotografías</strong><span>{total} de {MAX_PHOTOS}</span></div>
    <p>JPG, PNG o WebP. Hasta 4 MB cada una.{existingCount === 0 ? ' La primera será la portada.' : ' Las nuevas se agregarán después de las existentes.'}</p>
    {total < MAX_PHOTOS && <label className="listing-photo-input">Elegir fotos
      <input type="file" accept={PHOTO_TYPES.join(',')} multiple disabled={disabled} onChange={event => {
        onChoose(Array.from(event.target.files ?? []));
        event.target.value = '';
      }} />
    </label>}
    {files.length > 0 && <ul className="listing-photo-previews">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`}>
      {previews[index] && <img src={previews[index]} alt={`Vista previa ${index + 1}: ${file.name}`} />}
      <span>{file.name}</span>
      <button type="button" disabled={disabled} onClick={() => onRemove(index)} aria-label={`Quitar foto ${file.name}`}>Quitar</button>
    </li>)}</ul>}
    {total === MAX_PHOTOS && files.length === 0 && <span className="listing-photo-full">Ya tienes 3 fotografías en este anuncio.</span>}
  </div>;
}

export default function ListingForm({ id, initialDraft, initialPhotoCount = 0 }: { id?: string; initialDraft?: ListingDraft; initialPhotoCount?: number }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialDraft ?? initial);
  const [status, setStatus] = useState('');
  const [pending, startTransition] = useTransition();
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [retryId, setRetryId] = useState<string | null>(null);
  const savedListingId = useRef<string | null>(null);

  function choosePhotos(selected: File[]) {
    if (!selected.length) return;
    if (selected.length + photos.length + uploadedCount + initialPhotoCount > MAX_PHOTOS) {
      setStatus(`Este anuncio admite como máximo ${MAX_PHOTOS} fotografías.`);
      return;
    }
    if (selected.some(file => !PHOTO_TYPES.includes(file.type) || !file.size || file.size > MAX_PHOTO_BYTES)) {
      setStatus('Usa fotos JPG, PNG o WebP de hasta 4 MB cada una.');
      return;
    }
    setPhotos(current => [...current, ...selected]);
    setStatus('');
  }

  function change(key: keyof ListingDraft, value: string) {
    setDraft(current => ({
      ...current,
      [key]: value,
      ...(key === 'category' && !['Casas y departamentos','Terrenos y parcelas','Maquinaria agrícola'].includes(value) ? { operation: 'Venta' } : key === 'category' && value !== 'Casas y departamentos' && current.operation === 'Anticrético' ? { operation: 'Venta' } : {}),
      ...(key === 'category' && !['Lotes','Terrenos y parcelas','Casas y departamentos'].includes(value) ? { latitude: '', longitude: '' } : {}),
    }));
    setStatus('');
  }

  const isHome = draft.category === 'Casas y departamentos';
  const hasPropertyMap = ['Lotes','Terrenos y parcelas','Casas y departamentos'].includes(draft.category);
  const canRent = isHome || draft.category === 'Terrenos y parcelas' || draft.category === 'Maquinaria agrícola';
  const priceLabel = draft.operation === 'Alquiler' ? 'Mensualidad' : draft.operation === 'Anticrético' ? 'Monto del anticrético' : 'Precio';

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      let uploaded = 0;
      let uploadError = 'No pudimos subir una de las fotos. Intenta de nuevo.';
      try {
        if (!savedListingId.current) {
          const result = id ? await updateListing(id, draft) : await submitListing(draft);
          const listingId = id ?? ('id' in result ? result.id : undefined);
          if (!listingId || result.error) { setStatus(result.error || 'No se pudo guardar el anuncio.'); return; }
          savedListingId.current = listingId;
        }
        for (const file of photos) {
          setStatus(`Subiendo foto ${uploaded + 1} de ${photos.length}…`);
          const body = new FormData();
          body.set('photo', file);
          const response = await fetch(`/api/anuncios/${savedListingId.current}/fotos`, { method: 'POST', body });
          const result = await response.json().catch(() => ({})) as { error?: string };
          if (!response.ok) { uploadError = result.error || uploadError; throw new Error(uploadError); }
          uploaded++;
        }
        router.push('/mis-anuncios');
      } catch {
        if (savedListingId.current) {
          setUploadedCount(current => current + uploaded);
          setPhotos(photos.slice(uploaded));
          setRetryId(savedListingId.current);
          setStatus(`El anuncio quedó guardado, pero faltan fotos. ${uploadError}`);
        } else setStatus('No pudimos conectar con el servidor. Intenta de nuevo.');
      }
    });
  }

  const photoSelector = <PhotoSelector files={photos} existingCount={initialPhotoCount} uploadedCount={uploadedCount} disabled={pending} onChoose={choosePhotos} onRemove={index => setPhotos(current => current.filter((_, position) => position !== index))} />;

  if (retryId) return <form className="draft-form photo-retry-form" onSubmit={submit}>
    <div className="notice"><strong>El anuncio ya está guardado.</strong><p>Solo falta subir las fotografías pendientes. Puedes reintentarlo aquí o gestionarlas desde «Mis anuncios».</p></div>
    {photoSelector}
    <div className="photo-retry-actions"><button className="button" type="submit" disabled={pending}>{pending ? 'Subiendo…' : 'Reintentar fotos'}</button><Link href="/mis-anuncios">Ir a mis anuncios</Link></div>
    <p className="form-status" role="status">{status}</p>
  </form>;

  return <form className="draft-form" onSubmit={submit}>
    <div className="form-grid">
      <label className="wide">Título del anuncio<input required minLength={8} maxLength={100} value={draft.title} onChange={e => change('title', e.target.value)} placeholder="Ej.: Moto de trabajo en buen estado" /></label>
      <label>Categoría<select value={draft.category} onChange={e => change('category', e.target.value)}><option>Motos</option><option>Vehículos</option><option>Lotes</option><option>Terrenos y parcelas</option><option>Casas y departamentos</option><option>Maquinaria agrícola</option><option>Electrónicos</option><option>Otros</option></select></label>
      <label>Operación<select value={draft.operation} onChange={e => change('operation', e.target.value)}><option>Venta</option>{canRent && <option>Alquiler</option>}{isHome && <option>Anticrético</option>}</select></label>
      <div className="wide price-fields">
        <label>{priceLabel}<input type="number" min="1" max="999999999" step="0.01" required value={draft.price} onChange={e => change('price', e.target.value)} placeholder="0" /></label>
        <label>Moneda<select value={draft.currency} onChange={e => change('currency', e.target.value)}><option value="BOB">Bolivianos (Bs)</option><option value="USD">Dólares (US$)</option></select></label>
      </div>
      <label>Barrio, zona o comunidad<input required minLength={2} maxLength={100} value={draft.zone} onChange={e => change('zone', e.target.value)} placeholder="Dentro de San Julián" /></label>
      <label className="wide">Descripción<textarea required minLength={20} maxLength={3000} rows={5} value={draft.description} onChange={e => change('description', e.target.value)} placeholder="Describe su estado, características y condiciones." /></label>
      {photoSelector}
      {hasPropertyMap && <PropertyMapPicker latitude={draft.latitude} longitude={draft.longitude} onChange={(latitude, longitude) => { setDraft(current => ({ ...current, latitude, longitude })); setStatus(''); }} />}
      <label>Tu nombre o nombre comercial<input required minLength={2} maxLength={80} value={draft.contactName} onChange={e => change('contactName', e.target.value)} /></label>
      <label>WhatsApp de Bolivia<input required inputMode="tel" minLength={8} value={draft.whatsapp} onChange={e => change('whatsapp', e.target.value)} placeholder="Ej.: 7XXXXXXX" /></label>
    </div>
    <p className="muted">{id ? 'Los cambios quedarán en revisión. Si el anuncio estaba publicado, dejará de verse hasta que lo aprobemos de nuevo.' : 'Tu número será visible en el anuncio aprobado para que te contacten. Las fotos elegidas se subirán al enviar el anuncio.'}</p>
    <button className="button" type="submit" disabled={pending}>{pending ? 'Enviando…' : id ? 'Guardar y enviar a revisión' : 'Enviar para revisión'}</button>
    <p className="form-status" role="status">{status}</p>
  </form>;
}
