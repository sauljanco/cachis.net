# Verificación local de cachis.net

27 de septiembre de 2026.

- `npm run db:migrate`: esquema aplicado en el proyecto Neon de Virginia; reejecución sin cambios; tres ubicaciones verificadas.
- `npm run typecheck` y `npm run build`: correctos tras integrar catálogo, cuentas, publicación, fotos y moderación.
- Neon Object Storage: subida y lectura de una imagen WebP de prueba correctas; el archivo se eliminó al finalizar.
- Navegador: catálogo vacío conectado a Neon y página de cuenta visibles. Publicación anónima pide iniciar sesión.
- Comprobaciones de acceso: `/administrar` devuelve 404 sin cuenta administradora; subida anónima devuelve 401; `/api/auth/get-session` devuelve `null` sin sesión.

Queda verificar el recorrido con cuentas reales (registro, inicio de sesión, anuncio, foto y aprobación). `ADMIN_USER_IDS` aún debe apuntar a la cuenta administradora que se cree. El navegador Chrome del equipo muestra un aviso de hidratación causado por atributos inyectados por una extensión (`bis_skin_checked`); no impidió cargar las rutas comprobadas.

No se ha desplegado el sitio público. La PWA todavía no tiene service worker ni prueba de instalación/offline.
