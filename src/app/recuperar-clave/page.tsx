import Link from 'next/link';
import { Suspense } from 'react';
import PasswordRecovery from '@/components/password-recovery';

export const metadata = { title: 'Recuperar contraseña', robots: { index: false, follow: false } };

export default function RecoveryPage() {
  return <main id="contenido" className="container publish-page">
    <Link href="/cuenta" className="back">← Volver a tu cuenta</Link>
    <h1>Recuperar acceso</h1>
    <Suspense fallback={<p>Preparando recuperación…</p>}><PasswordRecovery /></Suspense>
  </main>;
}
