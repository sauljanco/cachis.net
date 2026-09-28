'use client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { changeListingStatus } from '@/app/actions';

export default function ListingControls({id,status}:{id:string;status:string}){
  const router=useRouter();const [pending,startTransition]=useTransition();const [message,setMessage]=useState('');
  const next=status==='published'?'paused':status==='paused'?'pending':null;
  if(!next)return null;
  function change(){startTransition(async()=>{const result=await changeListingStatus(id,next!);if(result.error)setMessage(result.error);else router.refresh();});}
  return <div><button type="button" className="text-button" disabled={pending} onClick={change}>{status==='published'?'Pausar anuncio':'Solicitar nueva revisión'}</button><p role="status">{message}</p></div>;
}
