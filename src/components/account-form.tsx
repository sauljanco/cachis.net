'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { authClient } from '@/lib/auth/client';

function loginError(error: unknown) {
  const detail = error && typeof error === 'object' ? error as { status?: number; code?: string; message?: string } : null;
  if (detail?.status === 401 || detail?.code === 'INVALID_EMAIL_OR_PASSWORD' || /invalid email or password/i.test(detail?.message ?? '')) {
    return 'Correo o contraseña incorrectos. Revisa tus datos o recupera tu contraseña.';
  }
  return 'No pudimos iniciar sesión. Intenta de nuevo en unos minutos.';
}

export default function AccountForm({signedIn=false}:{signedIn?:boolean}){
  const router=useRouter();
  const [mode,setMode]=useState<'login'|'signup'>('login');
  const [message,setMessage]=useState('');
  const [pending,startTransition]=useTransition();
  function signOut(){startTransition(async()=>{const result=await authClient.signOut();if(result.error){setMessage('No se pudo cerrar la sesión.');return;}router.refresh();});}
  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const data=new FormData(e.currentTarget);
    const email=String(data.get('email')||'').trim();
    const password=String(data.get('password')||'');
    const name=String(data.get('name')||'').trim();
    setMessage('');
    startTransition(async()=>{
      try {
        const result=mode==='login'?await authClient.signIn.email({email,password}):await authClient.signUp.email({email,password,name});
        if(result.error){setMessage(loginError(result.error));return;}
        router.push('/mis-anuncios');router.refresh();
      }catch(error){setMessage(loginError(error));}
    });
  }
  if(signedIn)return <><button className="text-button" type="button" disabled={pending} onClick={signOut}>Cerrar sesión</button><p role="status">{message}</p></>;
  return <div><div className="auth-tabs"><button type="button" aria-pressed={mode==='login'} onClick={()=>{setMode('login');setMessage('');}}>Iniciar sesión</button><button type="button" aria-pressed={mode==='signup'} onClick={()=>{setMode('signup');setMessage('');}}>Crear cuenta</button></div><form className="draft-form" onSubmit={submit}><div className="form-grid">{mode==='signup'&&<label className="wide">Tu nombre<input name="name" required minLength={2} autoComplete="name" /></label>}<label className="wide">Correo electrónico<input name="email" type="email" required autoComplete="email" /></label><label className="wide">Contraseña<input name="password" type="password" required minLength={8} autoComplete={mode==='login'?'current-password':'new-password'} /></label></div><button className="button" type="submit" disabled={pending}>{pending?'Un momento…':mode==='login'?'Iniciar sesión':'Crear cuenta'}</button>{mode==='login'&&<p className="recovery-link"><Link href="/recuperar-clave">¿Olvidaste tu contraseña?</Link></p>}<p role="status" className="form-status">{message}</p></form></div>;
}
