import Link from 'next/link';
import { currentUser, isAdmin } from '@/lib/auth/server';
import AccountForm from '@/components/account-form';

export const dynamic='force-dynamic';
export const metadata={title:'Tu cuenta'};
export default async function AccountPage({searchParams}:{searchParams:Promise<{link?:string}>}){
  const user=await currentUser();
  const {link}=await searchParams;
  return <main id="contenido" className="container publish-page account-page"><Link href="/" className="back">← Volver a los anuncios</Link><h1>Tu cuenta</h1>{user?<div className="notice"><strong>Sesión iniciada</strong><p>{user.email}</p><div className="owner-shortcuts"><Link href="/mis-anuncios" className="button">Ver mis anuncios</Link>{isAdmin(user.id)&&<Link href="/administrar" className="button owner-admin-link">Abrir panel administrador</Link>}</div><AccountForm signedIn /></div>:<AccountForm linkExisting={link==='google'} />}</main>;
}
