'use client';
import { useRouter } from 'next/navigation';
import { useRef,useState } from 'react';

export default function PhotoUpload({ id, count }: { id: string; count: number }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const remaining = Math.max(0, 3 - count);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const files = Array.from(input.current?.files ?? []);
    if (!files.length) return;
    if (files.length > remaining) { setMessage(`Puedes agregar ${remaining} foto${remaining === 1 ? '' : 's'} más.`); return; }
    if (files.some(file => file.size > 4 * 1024 * 1024)) { setMessage('Cada foto debe pesar 4 MB o menos.'); return; }
    setBusy(true);
    let uploaded = 0;
    try {
      for (const file of files) {
        setMessage(`Subiendo foto ${uploaded + 1} de ${files.length}…`);
        const body = new FormData();
        body.set('photo', file);
        const response = await fetch(`/api/anuncios/${id}/fotos`, { method: 'POST', body });
        const result = await response.json();
        if (!response.ok) { setMessage(result.error || 'No se pudo subir la foto.'); return; }
        uploaded++;
      }
      setMessage(`${uploaded} foto${uploaded === 1 ? '' : 's'} guardada${uploaded === 1 ? '' : 's'}.`);
    } catch { setMessage('No se pudo subir la foto. Intenta de nuevo.'); }
    finally {
      if (uploaded) { if (input.current) input.current.value = ''; router.refresh(); }
      setBusy(false);
    }
  }

  if (!remaining) return <p className="photo-limit">3 de 3 fotos cargadas.</p>;
  return <form className="photo-upload" onSubmit={submit}>
    <label>Fotografías ({count} de 3; JPG, PNG o WebP, hasta 4 MB cada una)
      <input ref={input} name="photo" type="file" accept="image/jpeg,image/png,image/webp" multiple required onChange={() => setMessage('')} />
    </label>
    <button className="text-button" type="submit" disabled={busy}>{busy ? 'Subiendo…' : 'Subir fotos'}</button>
    <p role="status">{message}</p>
  </form>;
}
