# cachis.net

Marketplace móvil para iniciar en San Julián, Santa Cruz, Bolivia. Anuncios de motos, vehículos, lotes, casas y departamentos en venta, alquiler o anticrético, con importes en BOB o USD.

## Estado actual

- Next.js 16, TypeScript y PWA instalable con pantalla informativa sin conexión.
- Neon PostgreSQL en Virginia con esquema `cachis`, ubicaciones jerárquicas y migraciones versionadas.
- Neon Auth para crear cuenta e iniciar sesión.
- Catálogo y fichas desde anuncios aprobados, contacto por WhatsApp, publicación sujeta a moderación y panel privado para propietarios. Los propietarios pueden editar sus anuncios; cada edición vuelve a revisión.
- Fotos procesadas a WebP, máximo 4 MB de entrada y cinco por anuncio, en el bucket privado `anuncios` de Neon Object Storage. El límite deja margen para el cuerpo multipart de Vercel Functions (4,5 MB).
- Panel de moderación protegido por `ADMIN_USER_IDS`.
- Los usuarios registrados pueden reportar anuncios publicados; el administrador revisa cada reporte y puede descartarlo o pausar el anuncio.
- El panel privado de oportunidades permite registrar contactos comerciales, etapas, próximos pasos y seguimientos pendientes.

El repositorio no contiene credenciales. `src/lib/listings.ts` conserva los tipos y utilidades del catálogo. Los anuncios de demostración fueron retirados.

## Desarrollo local

Requiere Node.js 20.9 o superior. Copia `.env.example` a `.env.local` y configura Neon. No publiques `.env.local` ni pegues sus valores en incidencias o capturas.

```powershell
npm install
npm run db:migrate
npm run dev
```

Abre `http://localhost:3000` (con `localhost`, como indica `APP_URL`). Neon Auth rechaza el registro si se usa `127.0.0.1` como origen. Para verificar: `npm run typecheck` y `npm run build`.

`ADMIN_USER_IDS` acepta los identificadores de usuarios administradores separados por coma. Se configura después de crear la cuenta que moderará. Sin esta variable nadie puede aprobar anuncios.

## Antes de abrir al público

- Completar la prueba de aprobación de anuncios, cierre de sesión y recuperación de cuenta. Ya se verificaron registro, inicio de sesión, publicación pendiente, subida y lectura privada de fotos, rechazo por moderación, catálogo vacío y acceso anónimo restringido. El anuncio y la foto de prueba fueron retirados.
- Agregar favoritos por cuenta, controles de abuso adicionales, pruebas de recuperación y políticas de privacidad.
- Verificar la instalación de la PWA en Android e iOS y decidir si conviene guardar contenido público para lectura sin conexión. La pantalla offline actual no almacena anuncios ni datos de cuentas.
- Completar SEO y analítica. La indexación está desactivada durante el piloto.
- Verificar en producción el recorrido de cuenta, anuncio, foto, reporte y moderación; respaldar y probar restauración. El dominio oficial ya está conectado a Vercel.

El roadmap entregado por el propietario ordena el trabajo por fases: estabilización, marketplace, confianza, gestión comercial, empresas, monetización y escala. El MVP no incluye pagos de compraventas.

## Despliegue actual en Vercel

El proyecto está conectado a GitHub y se publica en `https://cachis.net`. `https://www.cachis.net` redirige permanentemente al dominio principal. `https://cachis-net.vercel.app` sigue como dirección técnica de Vercel. Neon proporciona PostgreSQL, autenticación y almacenamiento. Antes de enviar nuevos cambios, ejecutar `npm run db:migrate` si hay migraciones nuevas; después verificar `npm run typecheck` y `npm run build`.

Las variables privadas de producción son `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_USER_IDS`, `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_ACCESS_KEY_ID`, `NEON_STORAGE_SECRET_ACCESS_KEY` y `NEON_STORAGE_REGION`. `APP_URL` apunta a `https://cachis.net` y ese origen está en la lista de dominios confiables de Neon Auth. Nunca subir valores de `.env.local` a GitHub.

El equipo actual aparece en Vercel Hobby. Según las [reglas de Vercel](https://vercel.com/docs/limits/fair-use-guidelines), Hobby se limita a uso personal no comercial; antes de abrir el marketplace comercial al público se requiere Pro o Enterprise. No se ha contratado un plan en este repositorio.

Las fotos se limitan a 4 MB de entrada para dejar margen al cuerpo de las funciones de Vercel.
