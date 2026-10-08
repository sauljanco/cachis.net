import Link from 'next/link';
import { currentUser, isAdmin } from '@/lib/auth/server';
import { privateProfile } from '@/lib/profile';
import AccountForm from '@/components/account-form';
import ProfileEditor from '@/components/profile-editor';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Mi perfil' };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const user = await currentUser();
  const { link } = await searchParams;

  if (!user) return <main id="contenido" className="container profile-page profile-login">
    <div className="profile-intro"><p className="profile-kicker">TU ESPACIO</p><h1>Entra a tu cuenta</h1><p>Publica y administra tus anuncios desde un solo lugar.</p></div>
    <AccountForm linkExisting={link === 'google'} />
  </main>;

  const saved = await privateProfile(user.id);
  const authName = (user.name ?? '').trim();
  const [firstName = '', ...lastNameParts] = authName.split(/\s+/);
  const profile = saved ?? { firstName, lastName: lastNameParts.join(' '), phone: '', address: '' };
  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || user.email.split('@')[0];

  return <main id="contenido" className="container profile-page">
    <header className="profile-heading">
      <span className="profile-avatar" aria-hidden="true">{displayName.charAt(0).toLocaleUpperCase('es')}</span>
      <div className="profile-intro"><p className="profile-kicker">TU ESPACIO</p><h1>Mi perfil</h1><p>{displayName}</p></div>
    </header>

    <div className="profile-layout">
      <section className="profile-card profile-info" aria-labelledby="profile-data-title">
        <div className="profile-card-heading"><div><p className="profile-section-number">01 / PERFIL</p><h2 id="profile-data-title">Datos personales</h2></div><span className="profile-private-tag">Solo para ti</span></div>
        <ProfileEditor profile={profile} email={user.email} />
      </section>

      <div className="profile-side">
        <section className="profile-card profile-activity" aria-labelledby="profile-activity-title">
          <div className="profile-card-heading"><div><p className="profile-section-number">02 / ACTIVIDAD</p><h2 id="profile-activity-title">Tu espacio</h2></div></div>
          <nav className="profile-shortcuts" aria-label="Opciones de tu cuenta">
            <Link href="/mis-anuncios"><span>Mis anuncios<small>Gestiona tus publicaciones</small></span><span aria-hidden="true">↗</span></Link>
            <Link href="/publicar"><span>Publicar anuncio<small>Crea una nueva publicación</small></span><span aria-hidden="true">↗</span></Link>
            {isAdmin(user.id) && <Link href="/administrar"><span>Panel administrador<small>Modera anuncios y gestiona el CRM</small></span><span aria-hidden="true">↗</span></Link>}
          </nav>
        </section>
        <section className="profile-card profile-access" aria-labelledby="profile-access-title">
          <div className="profile-card-heading"><div><p className="profile-section-number">03 / ACCESO</p><h2 id="profile-access-title">Acceso y seguridad</h2></div></div>
          <AccountForm signedIn />
        </section>
      </div>
    </div>
  </main>;
}
