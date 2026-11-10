# Auditoría de seguridad, datos y pagos

[← Índice](./README.md)

Alcance: código del repositorio (backend, frontend, esquema y migraciones, CI) y comprobaciones pasivas sobre producción (cabeceras HTTP y páginas públicas con `curl`). **No** se han lanzado ataques contra producción, ni se han hecho cobros o envíos reales, ni se ha accedido a la base de datos de producción.

Severidad: **Crítica** (explotable de forma remota con impacto grave inmediato), **Alta**, **Media**, **Baja**, **Info**.

## Hallazgos corregidos

| ID | Sev. | Hallazgo | Causa | Riesgo | Corrección | Ficheros | Commit |
|---|---|---|---|---|---|---|---|
| S-01 | Alta | 429 generalizados (login, `checkout-result` tras pagar) | El backend veía la IP de salida de Vercel en todas las peticiones proxificadas: un único cubo de 60/min para todos | Denegación de servicio involuntaria; usuarios sin confirmar su compra | IP del visitante firmada con `BACKEND_PROXY_SECRET` y validada en `ClientIpThrottlerGuard`; cubo SSR separado; SSR con sesión reenvía la IP | `common/guards/client-ip-throttler.guard.ts`, `frontend/src/lib/backend-proxy-headers.ts`, `lib/backend-url.ts`, `lib/api.ts`, rutas `app/api/**` | 41ecbc6, 543e5bd |
| S-02 | Alta | La rotación de refresh tokens no invalidaba los anteriores | Se guardaba `bcrypt(refreshJWT)`; bcrypt solo usa 72 bytes y los JWT del mismo usuario comparten ese prefijo | Un refresh robado seguía sirviendo tras la rotación | `SHA-256` del token + `jti` aleatorio; compatibilidad con hashes bcrypt existentes | `auth/refresh-token.util.ts`, `auth/auth.service.ts` | a0beb90 |
| S-03 | Alta | Inyección HTML en emails enviados por Radar VPO | `renderTemplate` insertaba `{{name}}` (texto libre del registro) sin escapar; también los fallbacks | Phishing desde el dominio propio: registrar el email de una víctima con un nombre que contenga enlaces | Escape HTML de todas las variables en cuerpos de email; asuntos/SMS siguen en texto plano; test | `notifications/message-vars.ts`, `commerce/message-templates.service.ts`, `notifications.service.ts`, `auth.service.ts`, `billing.service.ts` | 764820e |
| S-04 | Alta | El borrado de usuario por un admin eliminaba compras, suscripciones y consentimientos en cascada | `user.delete` con `onDelete: Cascade` | Pérdida de registros con obligación de conservación (fiscal, prueba del contrato) | Si hay compras/suscripciones/consentimientos → anonimización; borrado físico solo sin registros comerciales | `backoffice/backoffice.service.ts`, `users/users.service.ts`, `admin/users/page.tsx` | b9269ae |
| S-05 | Media | La baja de cuenta dejaba datos personales | No se limpiaban `delivery_logs` (email/teléfono y contenido), `waitlist_leads`, tokens de verificación, alertas | Incumplimiento del derecho de supresión | `anonymizeAccount` amplía la limpieza; auditoría si actúa un admin; test de integración | `users/users.service.ts`, `test/data-lifecycle.integration-spec.ts` | b9269ae |
| S-06 | Media | La baja anonimizaba aunque Stripe no cancelase la suscripción | El error de Stripe se ignoraba | Cobros recurrentes a una cuenta inexistente | Si falla y hay suscripción activa → 503 sin cambios; test | `users/users.service.ts` | 3c200d2 |
| S-07 | Media | Eventos Stripe bloqueados para siempre | Un claim `processing` que no terminaba (caída del proceso) hacía que los reintentos se tratasen como duplicados | Pago cobrado sin acceso concedido | Claims > 10 min se liberan | `billing/billing.service.ts` | b78fa6c |
| S-08 | Media | Estado de suscripción incorrecto con eventos desordenados | Se aplicaba el snapshot del evento | Acceso PRO concedido o retirado por error | Se consulta el estado actual en Stripe (fallback al snapshot si 404) | `billing/billing.service.ts` | b78fa6c |
| S-09 | Media | Visitantes podían paginar más allá de la ventana de 10 promociones | `offset` no se limitaba | Elusión del nivel de acceso (contenido de registrados) | Ventana `offset + limit ≤ 10` para visitantes; test | `promotions/promotions.service.ts` | 079c5f5 |
| S-10 | Media | Respuestas personalizadas sin `Cache-Control` | Rutas de autenticación opcional (`/promotions`, `/courses`) varían según la sesión | Una caché compartida podría servir datos de un usuario a otro | `private, no-store` siempre que haya cookie de sesión o `Authorization` (verificado) | `backend/src/main.ts` | 191d163 |
| S-11 | Media | AdSense cargaba antes del consentimiento | `adsbygoogle.js` en el `<head>` para "verificación" | Cookies/peticiones publicitarias sin consentimiento (LSSI art. 22.2) | Antes del consentimiento solo la meta `google-adsense-account` | `components/ads/adsense-site-verification.tsx` | 543e5bd |
| S-12 | Media | Vista previa de plantillas con `dangerouslySetInnerHTML` en el panel admin | HTML editable renderizado en el origen de la aplicación | XSS almacenado entre administradores | `<iframe sandbox="">` sin scripts ni mismo origen | `admin/message-templates/page.tsx` | 764820e |
| S-13 | Baja | Claves S3 predecibles | `carpeta/<timestamp>-<nombre>` | Si el bucket tuviera lectura pública, la guía de pago sería adivinable | 24 hex aleatorios en la clave | `storage/s3-storage.service.ts` | 391a5c3 |
| S-14 | Baja | Comparación no constante de `JOBS_ADMIN_TOKEN` | `!==` | Ataque de tiempo teórico | `timingSafeEqual` sobre SHA-256 | `jobs/jobs.controller.ts` | 391a5c3 |
| S-15 | Baja | Enumeración de cuentas por tiempo de login | Sin usuario no se ejecutaba bcrypt | Saber si un email está registrado | `bcrypt.compare` contra hash fijo | `auth/auth.service.ts` | a0beb90 |
| S-16 | Baja | Accesos (entitlements) fuera de ventana | No se filtraba `startsAt`/`endsAt` | Acceso antes/después de lo concedido | Filtro por ventana | `courses/courses.service.ts` | b78fa6c |
| S-17 | Baja | Logs de producción poco útiles o con datos | Mensajes de error completos/no clasificados | Datos personales en logs o errores sin diagnóstico | 5xx: nombre, código, stack sin mensaje; 4xx como `warn` | `common/filters/all-exceptions.filter.ts` | 079c5f5 |
| D-01 | Media | Deriva de esquema y 21 índices ausentes en FKs/consultas frecuentes | Índices creados a mano no declarados; FKs sin índice | Lentitud y migraciones que intentan borrar índices | Índices declarados + migración aditiva con `down.sql` | `prisma/schema.prisma`, `migrations/20261110120000_audit_indexes/` | a0a745f |
| D-02 | Media | Sin retención de sesiones, tokens y registros | — | Conservación indefinida de datos personales | Job de retención (desactivado por defecto) + script de integridad de solo lectura | `jobs/data-retention.ts`, `jobs/jobs.service.ts`, `scripts/db-integrity-check.sql` | e6dc1f3 |
| O-01 | Media | CI en rojo y suites de BD omitidas | Errores de lint previos; sin PostgreSQL en CI | Regresiones sin detectar | Lint corregido; CI con PostgreSQL 16 y migraciones desde cero | `.github/workflows/ci.yml` | bfb5645, 8f2688e |

## Verificado sin cambios (correcto)

- **IDOR**: las rutas de usuario usan el `userId` del JWT (`@CurrentUser`), no parámetros; `/backoffice/*` exige rol admin leído de BD (74 rutas, ver inventario).
- **Escalada de privilegios**: `forbidNonWhitelisted` rechaza campos extra (`isAdmin` → 400, verificado); el rol no se acepta en DTOs de usuario.
- **Inyección SQL**: todo el acceso a datos es vía Prisma (consultas parametrizadas); no hay SQL crudo en `backend/src`.
- **XSS en frontend**: el único `dangerouslySetInnerHTML` restante es el JSON-LD de `structured-data.tsx`, con `<` escapado; el contenido de lecciones/noticias se renderiza con React.
- **CSRF**: comprobación de origen en peticiones con cookies (verificado en modo producción: 403 desde otro origen).
- **Cookies**: `httpOnly`, `secure` en producción; tokens nunca en `localStorage`.
- **Contraseñas y tokens**: bcrypt para contraseñas; tokens de verificación/reset guardados como hash, de un solo uso, con caducidad.
- **Stripe**: firma del webhook verificada con cuerpo crudo; importes calculados en servidor.
- **Ficheros**: privados solo tras comprobar acceso; MIME + tamaño validados; solo admins suben.
- **Cabeceras en producción** (`curl -I https://www.radarvpo.com`): CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`.
- **Errores**: en producción no se devuelven stacks; Swagger desactivado (`/api/docs` → 404).
- **Exposición de datos**: `users/me` y listados admin usan `select`/serializadores explícitos (sin `passwordHash` ni hashes de tokens).
- **Secretos**: no hay secretos en el repositorio; `.env.example` sin valores reales; `BACKEND_PROXY_SECRET` sin prefijo `NEXT_PUBLIC_`.

## Riesgos pendientes (no corregidos)

| ID | Sev. | Riesgo | Recomendación |
|---|---|---|---|
| P-01 | Media | CSP con `'unsafe-inline'` en `script-src` y comodines amplios (`*.a.run.app`, `*.us-central1.run.app`, `*.ecs.us-west-1.on.aws`, `https:` en `img-src`) necesarios para Meta/Google | Migrar a CSP con nonce (requiere render dinámico) y acotar orígenes cuando Meta publique dominios fijos |
| P-02 | Media | Bloqueo de cron no atómico (seguro solo con 1 instancia) | `pg_advisory_lock` antes de escalar |
| P-03 | Media | Reembolsos PRO y disputas manuales | Procedimiento en [operations.md](./operations.md#reembolsos-y-disputas); automatizar `charge.dispute.closed` si el volumen crece |
| P-04 | Baja | Access token de 7 días | Mitigado (sesión comprobada en BD en cada petición); valorar 15–60 min con refresh |
| P-05 | Baja | Carrera de refresh entre pestañas (cierre de sesión ocasional) | Deduplicar refresh en cliente (BroadcastChannel/lock) |
| P-06 | Baja | El registro indica si un email ya existe | Mensaje genérico + email al titular (afecta a UX) |
| P-07 | Baja | Imágenes de lecciones de pago son públicas | Marcar como privadas si se consideran contenido de pago |
| P-08 | Baja | Sin reintento automático de emails/SMS fallidos | Cola con reintentos o revisión de `delivery_failures` |
| P-09 | Info | Campo `isProOnly` sin uso | Eliminar en una migración futura (no destructiva hoy) |
| P-10 | Info | Sin APM/alertas | Monitor externo de `/healthz` + alertas de webhooks |

## No verificable desde el repositorio

Configuración real de Railway/Vercel (variables, réplicas, copias), política del bucket S3, dominios de envío en Brevo (SPF/DKIM/DMARC), endpoints de webhook configurados en Stripe, estado de los datos en producción (ejecutar `backend/scripts/db-integrity-check.sql`).
