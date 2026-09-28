# cachis.net

Marketplace móvil para iniciar en San Julián, Santa Cruz, Bolivia. Anuncios de motos, vehículos, lotes, casas y departamentos en venta, alquiler o anticrético, con importes en BOB.

## Estado actual

- Next.js 16, TypeScript y PWA inicial.
- Neon PostgreSQL en Virginia con esquema `cachis`, ubicaciones jerárquicas y migraciones versionadas.
- Neon Auth para crear cuenta e iniciar sesión.
- Catálogo y fichas desde anuncios aprobados, contacto por WhatsApp, publicación sujeta a moderación y panel privado para propietarios.
- Fotos procesadas a WebP, máximo 5 MB de entrada y cinco por anuncio, en el bucket privado `anuncios` de Neon Object Storage.
- Panel de moderación protegido por `ADMIN_USER_IDS`.

El repositorio no contiene credenciales. `src/lib/listings.ts` conserva los tipos y utilidades del catálogo. Los anuncios de demostración fueron retirados.

## Desarrollo local

Requiere Node.js 20.9 o superior. Copia `.env.example` a `.env.local` y configura Neon. No publiques `.env.local` ni pegues sus valores en incidencias o capturas.

```powershell
npm install
npm run db:migrate
npm run dev
```

Abre `http://127.0.0.1:3000`. Para verificar: `npm run typecheck` y `npm run build`.

`ADMIN_USER_IDS` acepta los identificadores de usuarios administradores separados por coma. Se configura después de crear la cuenta que moderará. Sin esta variable nadie puede aprobar anuncios.

## Antes de abrir al público

- Probar registro, inicio y cierre de sesión, publicación, carga de fotos y moderación con cuentas reales. Hasta ahora se verificaron compilación, lectura de catálogo vacío, acceso anónimo restringido y lectura/escritura del bucket privado con un archivo de prueba.
- Agregar edición de anuncios, favoritos por cuenta, reportes, controles de abuso, pruebas de recuperación y políticas de privacidad.
- Completar PWA instalable, soporte offline controlado, SEO y analítica. La indexación está desactivada durante el piloto.
- Configurar GitHub, hosting, variables de producción, dominio, respaldo y restauración. No se ha lanzado el sitio.

El roadmap entregado por el propietario ordena el trabajo por fases: estabilización, marketplace, confianza, gestión comercial, empresas, monetización y escala. El MVP no incluye pagos de compraventas.

**Hosting:** [Vercel Hobby restringe su uso a proyectos personales no comerciales](https://vercel.com/docs/plans/hobby). Antes del lanzamiento comercial de cachis.net hay que elegir un plan compatible o un alojamiento alternativo; no está contemplado pagar Vercel en este momento.
