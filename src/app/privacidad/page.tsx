import Link from 'next/link';

export const metadata = { title: 'Política de privacidad' };

export default function PrivacyPage() {
  return <main id="contenido" className="container policy-page">
    <Link href="/" className="back">← Volver a cachis.net</Link>
    <h1>Política de privacidad</h1>
    <p className="lead">Última actualización: 8 de octubre de 2026</p>
    <section><h2>Qué información usamos</h2><p>Al entrar con Google, recibimos los datos básicos que autorizas: nombre, correo electrónico y, si está disponible, foto de perfil. Google no nos entrega tu contraseña. En «Mi perfil» puedes añadir apellido, teléfono y dirección; estos dos últimos datos permanecen privados y no se agregan automáticamente a tus anuncios. Si publicas un anuncio, guardamos la información que ingresas, como título, descripción, precio, ubicación, fotografías y número de WhatsApp. También registramos los reportes que envías y los datos necesarios para mantener tu sesión.</p></section>
    <section><h2>Para qué la usamos</h2><p>Usamos esos datos para crear tu cuenta, mostrar y administrar anuncios, permitir el contacto entre interesados y anunciantes, revisar reportes y proteger el servicio. El nombre del anunciante, el contenido del anuncio, su ubicación indicada y su contacto pueden mostrarse públicamente en los anuncios publicados.</p></section>
    <section><h2>Servicios que procesan datos</h2><p>La autenticación y la base de datos funcionan con Neon; el sitio se aloja en Vercel. Google interviene únicamente cuando eliges iniciar sesión con tu cuenta de Google. El sitio también puede cargar mapas de terceros al ver la ubicación de un anuncio.</p></section>
    <section><h2>Tu cuenta y tus consultas</h2><p>Puedes gestionar tus anuncios desde «Mis anuncios». Si necesitas consultar, corregir o solicitar la eliminación de los datos de tu cuenta, escribe a <a href="mailto:sauljanco@gmail.com">sauljanco@gmail.com</a>. Revisaremos tu solicitud y responderemos por ese medio.</p></section>
    <section><h2>Cambios</h2><p>Actualizaremos esta página cuando cambien las funciones del servicio o el tratamiento de datos. La fecha de actualización aparecerá al inicio.</p></section>
  </main>;
}
