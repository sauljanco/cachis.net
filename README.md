# cachis.net

Marketplace móvil para iniciar en San Julián, Santa Cruz, Bolivia. Anuncios de motos, vehículos, lotes, casas y departamentos en venta, alquiler o anticrético, con importes en BOB.

## Estado actual

- Next.js 16, TypeScript y PWA instalable con pantalla informativa sin conexión.
- Neon PostgreSQL en Virginia con esquema `cachis`, ubicaciones jerárquicas y migraciones versionadas.
- Neon Auth para crear cuenta e iniciar sesión.
- Catálogo y fichas desde anuncios aprobados, contacto por WhatsApp, publicación sujeta a moderación y panel privado para propietarios. Los propietarios pueden editar sus anuncios; cada edición vuelve a revisión.
- Fotos procesadas a WebP, máximo 4 MB de entrada y cinco por anuncio, en el bucket privado `anuncios` de Neon Object Storage. El límite deja margen para el cuerpo multipart de Vercel Functions (4,5 MB).
- Panel de moderación protegido por `ADMIN_USER_IDS`.

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
- Agregar favoritos por cuenta, reportes, controles de abuso, pruebas de recuperación y políticas de privacidad.
- Verificar la instalación de la PWA en Android e iOS y decidir si conviene guardar contenido público para lectura sin conexión. La pantalla offline actual no almacena anuncios ni datos de cuentas.
- Completar SEO y analítica. La indexación está desactivada durante el piloto.
- Verificar en producción el recorrido de cuenta, anuncio, foto y moderación; después conectar el dominio, respaldar y probar restauración. El propietario informa que el sitio ya se publicó en Netlify.

El roadmap entregado por el propietario ordena el trabajo por fases: estabilización, marketplace, confianza, gestión comercial, empresas, monetización y escala. El MVP no incluye pagos de compraventas.

## Alojamiento gratuito elegido para el piloto

Usar [Netlify Free](https://www.netlify.com/pricing/) para el frontend y las funciones de Next.js, con Neon como base de datos, autenticación y almacenamiento. Netlify [permite proyectos comerciales en Free](https://www.netlify.com/blog/introducing-netlify-free-plan/) y [soporta App Router, Server Actions y Route Handlers](https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/). Su límite actual es de 300 créditos mensuales: al agotarse, el sitio se pausa hasta el siguiente ciclo. Este plan evita el coste fijo de Vercel Pro durante el piloto, pero requiere vigilar el consumo.

Para desplegar: crea o abre tu cuenta de Netlify, importa `sauljanco/cachis.net` desde GitHub como proyecto Next.js, usa `npm run build` y deja que Netlify configure su adaptador automáticamente. En las variables de entorno del proyecto configura `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `ADMIN_USER_IDS`, `NEON_STORAGE_ENDPOINT`, `NEON_STORAGE_ACCESS_KEY_ID`, `NEON_STORAGE_SECRET_ACCESS_KEY` y `NEON_STORAGE_REGION`; agrega `APP_URL` con la URL pública definitiva. Copia los valores desde `.env.local` mediante el panel privado, nunca al repositorio ni al chat. Registra esa URL como origen permitido en Neon Auth. Verifica inicio de sesión, publicación, foto y moderación en el dominio de Netlify antes de conectar `cachis.net` en DNS. Después de añadir el dominio, cambia `APP_URL` y agrega el nuevo origen en Neon Auth.

Netlify Functions admite [6 MB de cuerpo, con unos 4,5 MB efectivos para archivos binarios](https://docs.netlify.com/build/functions/configuration/); las fotos se limitan a 4 MB.

Deploy Vercel
