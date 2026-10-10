'use client';
import { useRouter } from 'next/navigation';
import { useState,useTransition } from 'react';
import { moderate } from '@/app/actions';

export default function ModerationControls({id,hasPhoto}:{id:string;hasPhoto:boolean}){
  const router=useRouter();const [pending,startTransition]=useTransition();const [message,setMessage]=useState('');
  function decide(decision:'published'|'rejected'){startTransition(async()=>{const result=await moderate(id,decision);if(result.error)setMessage(result.error);else router.refresh();});}
  return <div className="moderation-actions"><button className="button" type="button" disabled={pending || !hasPhoto} onClick={()=>decide('published')}>Aprobar</button><button className="text-button" type="button" disabled={pending} onClick={()=>decide('rejected')}>Rechazar</button>{!hasPhoto && <p>Falta una foto para aprobar este anuncio.</p>}<p role="status">{message}</p></div>;
}
