import Link from 'next/link';

export const metadata = { title: 'Condiciones de uso' };

export default function TermsPage() {
  return <main id="contenido" className="container policy-page">
    <Link href="/" className="back">← Volver a cachis.net</Link>
    <h1>Condiciones de uso</h1>
    <p className="lead">Última actualización: 8 de octubre de 2026</p>
    <section><h2>Uso de cachis.net</h2><p>Cachis.net permite consultar y publicar anuncios. Para publicar, gestionar anuncios o enviar reportes necesitas una cuenta. Debes proporcionar información veraz, mantener actualizados tus anuncios y contar con autorización para ofrecer lo que publicas.</p></section>
    <section><h2>Anuncios y contacto</h2><p>El anunciante es responsable de la información, fotografías, precio, disponibilidad y condiciones de su oferta. Antes de realizar un pago o cerrar un acuerdo, confirma personalmente la identidad del anunciante, la documentación y las condiciones del bien o servicio. La publicación de un anuncio no implica que cachis.net garantice la operación.</p></section>
    <section><h2>Moderación</h2><p>Podemos revisar, rechazar, pausar o retirar anuncios que incumplan estas condiciones, resulten engañosos o reciban reportes fundados. No publiques contenido ilícito, ajeno sin permiso, falso o que vulnere derechos de otras personas.</p></section>
    <section><h2>Privacidad y contacto</h2><p>El tratamiento de datos se explica en la <Link href="/privacidad">Política de privacidad</Link>. Para consultas sobre el servicio escribe a <a href="mailto:sauljanco@gmail.com">sauljanco@gmail.com</a>.</p></section>
  </main>;
}
