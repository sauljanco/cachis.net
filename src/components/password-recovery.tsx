'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';

export default function PasswordRecovery() {
  const params = useSearchParams();
  const token = params.get('token');
  const expired = params.get('error') === 'INVALID_TOKEN';
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const [completed, setCompleted] = useState(false);

  function requestReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get('email') || '').trim();
    setMessage('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/request-password-reset', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, redirectTo: `${window.location.origin}/recuperar-clave` }),
        });
        setMessage(response.ok ? 'Si este correo tiene una cuenta, recibirás un enlace para restablecer la contraseña.' : 'No pudimos enviar el enlace. Intenta de nuevo.');
      } catch { setMessage('No pudimos enviar el enlace. Intenta de nuevo.'); }
    });
  }

  function reset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    const data = new FormData(event.currentTarget);
    const password = String(data.get('password') || '');
    if (password !== data.get('confirm')) { setMessage('Las contraseñas no coinciden.'); return; }
    setMessage('');
    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password }),
        });
        if (!response.ok) { setMessage('El enlace venció o la contraseña no cumple los requisitos. Solicita uno nuevo.'); return; }
        setCompleted(true);
        window.history.replaceState(null, '', '/recuperar-clave');
      } catch { setMessage('No pudimos cambiar la contraseña. Intenta de nuevo.'); }
    });
  }

  if (completed) return <div className="notice"><strong>Contraseña actualizada.</strong><p>Ya puedes iniciar sesión con tu nueva contraseña.</p><Link href="/cuenta" className="button">Ir a iniciar sesión</Link></div>;
  if (token && !expired) return <form className="form-grid recovery-form" onSubmit={reset}>
    <p className="wide lead">Elige una nueva contraseña de al menos ocho caracteres.</p>
    <label className="wide">Nueva contraseña<input name="password" type="password" minLength={8} autoComplete="new-password" required /></label>
    <label className="wide">Repite la contraseña<input name="confirm" type="password" minLength={8} autoComplete="new-password" required /></label>
    <div className="wide"><button className="button" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Cambiar contraseña'}</button><p role="status" className="form-status">{message}</p></div>
  </form>;
  return <form className="form-grid recovery-form" onSubmit={requestReset}>
    <p className="wide lead">Escribe el correo de tu cuenta. Te enviaremos un enlace para elegir otra contraseña.</p>
    {expired && <p className="wide notice">El enlace ya no es válido. Solicita uno nuevo.</p>}
    <label className="wide">Correo electrónico<input name="email" type="email" autoComplete="email" required /></label>
    <div className="wide"><button className="button" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar enlace'}</button><p role="status" className="form-status">{message}</p></div>
  </form>;
}
