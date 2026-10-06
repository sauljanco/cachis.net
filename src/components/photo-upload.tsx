'use client';
import { useRouter } from 'next/navigation';
import { useRef,useState } from 'react';

export default function PhotoUpload({id}:{id:string}){
  const router=useRouter();const input=useRef<HTMLInputElement>(null);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
  async function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();const file=input.current?.files?.[0];if(!file)return;
    if(file.size>4*1024*1024){setMessage('La foto debe pesar 4 MB o menos.');return;}
    setBusy(true);setMessage('Subiendo foto…');
    try{
      const body=new FormData();body.set('photo',file);
      const response=await fetch(`/api/anuncios/${id}/fotos`,{method:'POST',body});
      const result=await response.json();
      if(!response.ok){setMessage(result.error||'No se pudo subir la foto.');return;}
      if(input.current)input.current.value='';setMessage('Foto guardada.');router.refresh();
    }catch{setMessage('No se pudo subir la foto. Intenta de nuevo.');}finally{setBusy(false);}
  }
  return <form className="photo-upload" onSubmit={submit}><label>Agregar foto JPG, PNG o WebP (máximo 4 MB)<input ref={input} name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /></label><button className="text-button" type="submit" disabled={busy}>Subir foto</button><p role="status">{message}</p></form>;
}
