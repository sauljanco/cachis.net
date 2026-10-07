import Link from 'next/link';
import { currentUser, isAdmin } from '@/lib/auth/server';
import AccountForm from '@/components/account-form';

export const dynamic='force-dynamic';
export const metadata={title:'Tu cuenta'};
export default async function AccountPage(){
  const user=await currentUser();
  return <main id="contenido" className="container publish-page"><Link href="/" className="back">← Volver a los anuncios</Link><h1>Tu cuenta</h1>{user?<div className="notice"><strong>Sesión iniciada</strong><p>{user.email}</p><div className="owner-shortcuts"><Link href="/mis-anuncios" className="button">Ver mis anuncios</Link>{isAdmin(user.id)&&<Link href="/administrar" className="button owner-admin-link">Abrir panel administrador</Link>}</div><AccountForm signedIn /></div>:<AccountForm />}</main>;
}
