'use client';
import Link from 'next/link';
import { authClient } from '@/lib/auth/client';
import Icon from '@/components/icon';

export default function AccountNav() {
  const { data } = authClient.useSession();
  const name = data?.user?.name?.trim() || data?.user?.email?.split('@')[0] || '';
  const firstName = name.split(/\s+/)[0];
  return <Link href="/cuenta" className="nav-account nav-user" aria-label={name ? `Perfil de ${name}` : 'Cuenta'}>
    {name ? <span className="nav-avatar" aria-hidden="true">{firstName.charAt(0).toLocaleUpperCase('es')}</span> : <Icon name="user" />}
    <span className="nav-user-label">{firstName || 'Cuenta'}</span>
  </Link>;
}
