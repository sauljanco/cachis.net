'use client';
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/client';
import { savePrivateProfile } from '@/app/cuenta/actions';
import type { PrivateProfile } from '@/lib/profile';

export default function ProfileEditor({ profile, email }: { profile: PrivateProfile; email: string }) {
  const router = useRouter();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const data = {
      firstName: String(values.get('firstName') || ''),
      lastName: String(values.get('lastName') || ''),
      phone: String(values.get('phone') || ''),
      address: String(values.get('address') || ''),
    };
    setMessage('');
    startTransition(async () => {
      try {
        const result = await savePrivateProfile(data);
        if ('error' in result) { setMessage(result.error ?? 'No pudimos guardar tus datos.'); return; }
        const authResult = await authClient.updateUser({ name: result.name });
        setMessage(authResult.error
          ? 'Datos guardados. No pudimos actualizar el nombre del encabezado; inténtalo otra vez.'
          : 'Datos actualizados.');
        if (!authResult.error && disclosure.current) disclosure.current.open = false;
        router.refresh();
      } catch {
        setMessage('No pudimos guardar tus datos. Intenta de nuevo.');
      }
    });
  }

  return <div className="profile-personal">
    <dl className="profile-data">
      <div><dt>Nombre</dt><dd>{profile.firstName || 'Sin registrar'}</dd></div>
      <div><dt>Apellido</dt><dd>{profile.lastName || 'Sin registrar'}</dd></div>
      <div><dt>Correo electrónico</dt><dd>{email}</dd></div>
      <div><dt>Teléfono</dt><dd>{profile.phone || 'Añadir número'}</dd></div>
      <div><dt>Dirección</dt><dd>{profile.address || 'Añadir dirección'}</dd></div>
    </dl>
    <details className="profile-edit" ref={disclosure}>
      <summary>Editar mis datos <span aria-hidden="true">↗</span></summary>
      <form onSubmit={save} className="profile-edit-form">
        <div className="profile-fields">
          <label>Nombre<input name="firstName" defaultValue={profile.firstName} autoComplete="given-name" maxLength={60} required /></label>
          <label>Apellido<input name="lastName" defaultValue={profile.lastName} autoComplete="family-name" maxLength={60} /></label>
          <label>Teléfono<input name="phone" type="tel" defaultValue={profile.phone} autoComplete="tel" inputMode="tel" maxLength={24} placeholder="Ej. 70000000" /></label>
          <label>Dirección<input name="address" defaultValue={profile.address} autoComplete="street-address" maxLength={160} placeholder="Barrio, calle o referencia" /></label>
        </div>
        <p className="profile-privacy">Tu teléfono y dirección son privados. No se agregan automáticamente a tus anuncios.</p>
        <button className="button" type="submit" disabled={pending}>{pending ? 'Guardando…' : 'Guardar cambios'}</button>
      </form>
    </details>
    <p className="profile-save-status" role="status">{message}</p>
  </div>;
}
