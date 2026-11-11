# Operación: instalación, pruebas, despliegue, copias y recuperación

[← Índice](./README.md)

## Requisitos

- Node.js ≥ 20.11 (CI usa Node 22) y npm (workspaces).
- PostgreSQL 16 para desarrollo/pruebas.
- Cuentas de proveedor (solo producción): Railway, Vercel, Stripe, Brevo, almacenamiento S3-compatible, proveedor de IA.

## Instalación y desarrollo local

```bash
npm ci
cp backend/.env.example backend/.env          # completar valores locales
cp frontend/.env.example frontend/.env.local
npm --workspace backend run prisma:generate
DATABASE_URL=postgresql://USER:PASS@localhost:5432/radarvpo npm --workspace backend run prisma:deploy
npm run dev:backend      # http://localhost:3000/api/v1  (Swagger en /api/docs fuera de producción)
npm run dev:frontend     # http://localhost:3001
```

Variables mínimas del backend: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (≥ 32 caracteres), `FRONTEND_URL`. En producción también `CORS_ORIGIN` (el proceso no arranca sin ella). Inventario completo: [reference/env-vars.md](./reference/env-vars.md).

## Pruebas y comprobaciones

| Comando | Qué hace |
|---|---|
| `npm --workspace backend run lint` | ESLint + Prettier (tipado contra el cliente Prisma: ejecutar `prisma:generate` antes) |
| `npx tsc --noEmit` (en `backend/` y `frontend/`) | Comprobación de tipos |
| `npm --workspace backend run test:unit` | Jest unitario |
| `TEST_DATABASE_URL=postgresql://… npm --workspace backend run test:integration` | Integración contra PostgreSQL real (desechable, con migraciones aplicadas). Sin la variable, las suites de BD se omiten |
| `npm --workspace frontend run test` | Vitest |
| `npm run build` | Build de backend y frontend |
| `npm run docs:reference` | Regenera `docs/reference/*` desde el código |

CI (`.github/workflows/ci.yml`) ejecuta todo lo anterior en cada push/PR, con un PostgreSQL 16 efímero al que aplica todas las migraciones desde cero.

## Despliegue

Para probar antes de producción, ver [staging.md](./staging.md).

### Backend (Railway)

`backend/railway.json`: build Nixpacks; arranque `npm --workspace backend run prisma:deploy && npm --workspace backend run start:prod`; healthcheck `GET /api/v1/healthz`; reinicio `ON_FAILURE` (10 reintentos).

- Las migraciones se aplican **antes** de arrancar la nueva versión. Todas las migraciones de este repositorio son aditivas o compatibles con la versión anterior durante el despliegue.
- `.github/workflows/deploy.yml` despliega con `railway up` solo si existen `RAILWAY_TOKEN` y `RAILWAY_SERVICE_ID`; si no, se omite (el despliegue real puede venir de la integración Git de Railway; **comprobar en el panel** cuál está activa para no desplegar dos veces).
- **Una sola instancia**: el bloqueo de cron (`job_runs`) comprueba e inserta sin bloqueo de BD; con varias réplicas un job podría ejecutarse dos veces. No escalar horizontalmente sin sustituirlo por `pg_advisory_lock`.

### Frontend (Vercel)

Despliegue por integración Git o `deploy.yml` (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`). Variables `NEXT_PUBLIC_*` se incrustan en el build: cambiarlas exige redeploy.

### Checklist previa al lanzamiento (configuración)

1. **`BACKEND_PROXY_SECRET`**: generar `openssl rand -hex 32` y definir **el mismo valor** en Vercel (frontend, sin prefijo `NEXT_PUBLIC_`) y Railway (backend). Redeploy de ambos. Sin él, todos los visitantes comparten el límite por IP de Vercel (causa de los 429).
2. `NODE_ENV=production`, `FRONTEND_URL`, `CORS_ORIGIN` con los dominios definitivos.
3. Stripe: `STRIPE_SECRET_KEY` live, `STRIPE_WEBHOOK_SECRET` del endpoint live `https://<backend>/api/v1/billing/webhook` con los eventos listados en [integrations.md](./integrations.md#stripe-pagos).
4. Brevo: remitente verificado (SPF/DKIM/DMARC del dominio), `BREVO_SMS_SENDER` autorizado.
5. S3: bucket sin lectura pública a nivel de bucket; credenciales con permisos mínimos (Put/Get/Delete en el bucket).
6. Datos legales: `NEXT_PUBLIC_LEGAL_NAME`, `NEXT_PUBLIC_LEGAL_TAX_ID`, `NEXT_PUBLIC_LEGAL_ADDRESS` (hoy el aviso legal muestra "Pendiente de publicación").
7. `JOBS_ADMIN_TOKEN` (≥ 32 caracteres aleatorios) o vacío para desactivar `/jobs/*`.
8. Ejecutar en solo lectura `psql "$DATABASE_URL" -f backend/scripts/db-integrity-check.sql` y revisar que todas las filas devuelvan 0.

## Rate limit

- `ClientIpThrottlerGuard` (`backend/src/common/guards/client-ip-throttler.guard.ts`): límite global 60 peticiones/min por IP y límites específicos por endpoint ([endpoints.md](./reference/endpoints.md)).
- Las rutas de Next (`/api/backend/*`, `/api/auth/*`, `/p/:code`, …) reenvían la IP del visitante en `x-radar-client-ip`, firmada con `x-radar-proxy-secret`. El backend solo la acepta si el secreto coincide (comparación en tiempo constante) y la IP es válida.
- El SSR anónimo (páginas con ISR) comparte el cubo `frontend-ssr` con un límite 30× mayor; el SSR con sesión reenvía la IP del visitante.

**Medición (backend local, 3 visitantes × 30 peticiones a `GET /news`, límite 60/min):**

| Escenario | 200 | 429 |
|---|---|---|
| Antes: sin cabeceras (todos con la IP del proxy) | 60 | 30 |
| Después: secreto + IP de cada visitante | 90 | 0 |
| Cabecera de IP falsificada con secreto incorrecto | 0 | 90 (no se salta el límite) |

## Migraciones y rollback

- Crear: `npm --workspace backend run prisma:migrate` (desarrollo). Aplicar: `prisma:deploy`.
- Comprobar deriva: `npx prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --shadow-database-url <shadow>` debe quedar vacío.
- La migración de esta auditoría `20261110120000_audit_indexes` solo crea índices (`CREATE INDEX IF NOT EXISTS`). Rollback: ejecutar `backend/prisma/migrations/20261110120000_audit_indexes/down.sql` y borrar su fila de `_prisma_migrations` (instrucciones en el propio fichero). Probado localmente: aplicar → revertir → reaplicar.
- Rollback de una versión de aplicación: redeploy del commit anterior en Railway/Vercel. Como las migraciones son aditivas, la versión anterior funciona con el esquema nuevo.

## Copias de seguridad y restauración

No verificable desde el repositorio: **confirmar en Railway** que las copias automáticas de PostgreSQL están activas, su frecuencia y retención, y probar una restauración.

Copia lógica manual (desde una máquina con acceso, sin escribir en producción):

```bash
pg_dump "$DATABASE_URL" --format=custom --no-owner --file radarvpo-$(date +%F).dump
```

Restauración de prueba en una base **nueva** (nunca sobre producción sin autorización):

```bash
createdb radarvpo_restore
pg_restore --no-owner --dbname postgresql://…/radarvpo_restore radarvpo-AAAA-MM-DD.dump
psql postgresql://…/radarvpo_restore -f backend/scripts/db-integrity-check.sql
```

Los ficheros de S3 no están en la copia de la BD: activar versionado/replicación del bucket en el proveedor. Las copias contienen datos personales: cifrarlas y limitar el acceso.

## Observabilidad

| Señal | Dónde |
|---|---|
| Salud | `GET /api/v1/healthz` (healthcheck de Railway) |
| Errores | Logs de Railway: `AllExceptionsFilter` registra 5xx como `error` (nombre, código, 12 líneas de stack, sin mensaje) y 4xx como `warn` |
| Jobs | Tabla `job_runs` y `/admin` |
| Envíos | `delivery_logs`, `delivery_failures`, `/admin/sms` |
| Pagos | Dashboard de Stripe → Webhooks (reintentos/fallos); `stripe_processed_events` |

No hay APM ni alertas automáticas (p. ej. Sentry/Uptime): recomendado configurar al menos un monitor externo de `/healthz` y alertas de fallos de webhook en Stripe.

## Retención de datos

Desactivada por defecto. Tras alinear los plazos de `backend/src/jobs/data-retention.ts` con la política de privacidad: `DATA_RETENTION_ENABLED=true` (y opcionalmente `CRON_DATA_RETENTION`).

## Reembolsos y disputas

- **Curso**: reembolso total en Stripe → `charge.refunded` marca la compra como reembolsada y retira el acceso automáticamente.
- **PRO (mensual o pack)**: reembolsar en Stripe. Si además se debe retirar el acceso, cancelar la suscripción **inmediatamente** en Stripe (no "al final del periodo"); el webhook `customer.subscription.deleted` deja al usuario sin PRO.
- **Disputas**: no se procesan automáticamente; revisar en Stripe y, si se pierde, actuar como en un reembolso.

## Rotación de secretos

| Secreto | Efecto de rotarlo |
|---|---|
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Invalida todas las sesiones (los usuarios vuelven a iniciar sesión) |
| `BACKEND_PROXY_SECRET` | Cambiar a la vez en Vercel y Railway; durante el desfase los visitantes vuelven a compartir límite |
| `STRIPE_WEBHOOK_SECRET` | Rotar en Stripe y Railway a la vez; los eventos fallidos se reintentan |
| `BREVO_API_KEY`, credenciales S3, `OPENAI_API_KEY`, `JOBS_ADMIN_TOKEN` | Sin efecto para usuarios |
