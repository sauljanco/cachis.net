'use client';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, useState, useTransition } from 'react';
import { authClient } from '@/lib/auth/client';

const googleClientId = '983543200196-1qhm8bskahaav2eq40l3cvqjbrd53p43.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: { client_id: string; callback: (response: { credential: string }) => void }): void;
          renderButton(element: HTMLElement, options: { theme: string; size: string; text: string; locale: string }): void;
        };
      };
    };
  }
}

function destination() {
  const requested = new URLSearchParams(window.location.search).get('next');
  return requested && ['/publicar', '/mis-anuncios', '/'].includes(requested) ? requested : '/mis-anuncios';
}

function loginError(error: unknown) {
  const detail = error && typeof error === 'object' ? error as { status?: number; code?: string; message?: string } : null;
  if (detail?.status === 401 || detail?.code === 'INVALID_EMAIL_OR_PASSWORD' || /invalid email or password/i.test(detail?.message ?? '')) {
    return 'Correo o contraseña incorrectos. Revisa tus datos o recupera tu contraseña.';
  }
  return 'No pudimos iniciar sesión. Intenta de nuevo en unos minutos.';
}

function GoogleMark() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 48 48" focusable="false">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 5.38 6.51 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.3 5.48-4.86 7.18l7.73 6C44.32 38.03 46.98 31.68 46.98 24.55z" />
    <path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.28-3.13.78-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.88.93 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>;
}

export default function AccountForm({signedIn=false,linkExisting=false}:{signedIn?:boolean;linkExisting?:boolean}){
  const router=useRouter();
  const [message,setMessage]=useState('');
  const [pending,startTransition]=useTransition();
  const googleButton=useRef<HTMLDivElement>(null);

  function signOut(){startTransition(async()=>{const result=await authClient.signOut();if(result.error){setMessage('No se pudo cerrar la sesión.');return;}router.refresh();});}

  function signInWithGoogle(){
    setMessage('');
    startTransition(async()=>{
      try {
        const result=await authClient.signIn.social({provider:'google',callbackURL:destination()});
        if(result.error)setMessage('No pudimos conectar con Google. Intenta de nuevo.');
      }catch{setMessage('No pudimos conectar con Google. Intenta de nuevo.');}
    });
  }

  const renderGoogleLink = useCallback(() => {
    if (!signedIn || !googleButton.current || !window.google) return;
    googleButton.current.replaceChildren();
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: ({credential}) => {
        setMessage('');
        startTransition(async () => {
          try {
            const result = await authClient.linkSocial({provider:'google',idToken:{token:credential}});
            if (result.error) {
              setMessage('No pudimos vincular Google a tu cuenta. Comprueba que seleccionaste el mismo correo.');
              return;
            }
            setMessage('Google quedó vinculado. Ya puedes entrar con esa cuenta.');
            router.refresh();
          } catch {
            setMessage('No pudimos vincular Google a tu cuenta. Intenta de nuevo.');
          }
        });
      },
    });
    window.google.accounts.id.renderButton(googleButton.current,{theme:'outline',size:'large',text:'continue_with',locale:'es'});
  }, [signedIn, router]);

  function submit(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const data=new FormData(e.currentTarget);
    const email=String(data.get('email')||'').trim();
    const password=String(data.get('password')||'');
    setMessage('');
    startTransition(async()=>{
      try {
        const result=await authClient.signIn.email({email,password});
        if(result.error){setMessage(loginError(result.error));return;}
        router.push(linkExisting?'/cuenta':destination());router.refresh();
      }catch(error){setMessage(loginError(error));}
    });
  }

  if(signedIn)return <div className="auth-linked-account"><p>Si antes entrabas con contraseña, conecta tu Google aquí una sola vez. Conservarás tus anuncios y el mismo perfil.</p><Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={renderGoogleLink} /><div ref={googleButton} aria-label="Vincular mi cuenta de Google" /><button className="text-button" type="button" disabled={pending} onClick={signOut}>Cerrar sesión</button><p role="status">{pending?'Vinculando tu cuenta…':message}</p></div>;

  return <div className="auth-entry">
    <div className="auth-primary">
      <h2>Entra o crea tu cuenta</h2>
      <p>Usa tu cuenta de Google para publicar y gestionar tus anuncios. Solo te tomará un momento.</p>
      <button className="google-signin" type="button" onClick={signInWithGoogle} disabled={pending}><GoogleMark />{pending?'Conectando…':'Continuar con Google'}</button>
      <p className="auth-privacy">Tus anuncios siguen visibles para todos. Te pediremos iniciar sesión cuando quieras publicar o gestionar tu cuenta.</p>
    </div>
    <details className="auth-alternative" open={linkExisting}><summary>¿Ya tenías una cuenta con contraseña?</summary>
      {linkExisting&&<p>Entra con tu contraseña anterior. Después podrás vincular Google sin perder tus anuncios.</p>}
      <form className="draft-form" onSubmit={submit}><div className="form-grid"><label className="wide">Correo electrónico<input name="email" type="email" required autoComplete="email" /></label><label className="wide">Contraseña<input name="password" type="password" required autoComplete="current-password" /></label></div><button className="button" type="submit" disabled={pending}>Iniciar sesión</button><p className="recovery-link"><Link href="/recuperar-clave">¿Olvidaste tu contraseña?</Link></p></form>
    </details>
    <p role="status" className="form-status">{message}</p>
  </div>;
}
