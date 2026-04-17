# Radar VPO

Plataforma full-stack para deteccion de promociones de vivienda protegida (VPO/HPO), alertas de futuros lanzamientos y noticias relevantes, con foco en Catalunya.

## Stack

- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Backend: NestJS modular + REST `/api/v1`
- DB: PostgreSQL + Prisma ORM
- Auth: JWT + cookies HttpOnly
- Jobs: Nest Schedule (cron), preparable para Railway worker
- Deploy: Vercel (frontend), Railway (backend + PostgreSQL + workers)
- CI/CD: GitHub Actions (`.github/workflows/ci.yml`, `.github/workflows/deploy.yml`)

## Estructura

- `/backend`: API, Prisma, jobs, tests
- `/frontend`: app web responsive mobile-first
- `/package.json`: scripts de orquestacion monorepo

## Arranque local

### 1) Variables de entorno

1. Copia `backend/.env.example` a `backend/.env`.
2. Copia `frontend/.env.example` a `frontend/.env.local`.
3. Ajusta secrets y URLs.

### 2) Instalar dependencias

```bash
npm install
npm --workspace backend install
npm --workspace frontend install
```

### 3) Prisma

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4) Ejecutar en desarrollo

Terminal 1:
```bash
npm run dev:backend
```

Terminal 2:
```bash
npm run dev:frontend
```

- Backend: `http://localhost:3000`
- OpenAPI: `http://localhost:3000/api/docs`
- Frontend: `http://localhost:3001` (o puerto asignado por Next)

## Endpoints minimos implementados

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/users/me`
- `GET /api/v1/promotions`
- `GET /api/v1/promotions/:id`
- `POST /api/v1/promotions/:id/favorite`
- `GET /api/v1/alerts/upcoming`
- `GET /api/v1/news`
- `GET /api/v1/news/:id`
- `GET /api/v1/backoffice/overview`
- `GET /api/v1/backoffice/jobs`
- `GET /api/v1/backoffice/failures`
- `POST /api/v1/backoffice/promotions/:id/documents`
- `GET /api/v1/healthz`

## Jobs/automatizacion

Jobs implementados:

- `check_promotions`
- `process_pending_pdfs`
- `analyze_pending_promotions`
- `publish_pending_promotions`
- `send_reminders`
- `fetch_daily_news`
- `publish_educational_post`

Incluyen:

- Lock in-memory + lock por DB (job_runs en estado running reciente)
- Cadencia por variables `CRON_*`
- Timezone configurable `JOB_TIMEZONE`
- IA real multi-proveedor con retries + circuit breaker (`openai`, `azure-openai`, `anthropic`)
- Parseo PDF real con `pdf-parse` + fallback OCR real via OCR.Space
- Ingesta de noticias RSS real y anti-duplicados por hash SHA256
- Fallback de IA y registro en `delivery_failures`

### Fuente oficial Registre Sol·licitants (Catalunya)

El job `check_promotions` ahora analiza automaticamente:

- `https://www.registresolicitants.cat/registre/noticias/03_noticias.jsp`
- enlaces de detalle tipo `03_noticias_detalle.jsp?idNoticia=...`
- enlaces PDF dentro del detalle (incluyendo enlaces directos y patrones en `onclick`)

Resultado del scraping:

1. Crea/actualiza promociones en `promotions`.
2. Inserta PDFs nuevos en `promotion_documents`.
3. Activa `aiStatus=pending` para posterior OCR + extraccion IA.

Variables relacionadas:

- `REGISTRE_NEWS_URL`
- `REGISTRE_MIN_YEAR`
- `REGISTRE_MAX_PAGES`

## Flujo PDF/OCR + Extraccion estructurada

1. Crear o elegir una promocion.
2. Adjuntar URL del PDF/documento como admin:

```bash
curl -X POST http://localhost:3000/api/v1/backoffice/promotions/<PROMOTION_ID>/documents \
	-H "Content-Type: application/json" \
	-d '{"documentUrl":"https://.../bases.pdf","fileType":"pdf"}'
```

3. Esperar al cron `process_pending_pdfs` para extraer texto.
4. Esperar al cron `analyze_pending_promotions` para extraer JSON estructurado con IA.
5. Revisar resultados en `promotion_ai_analysis` y estado en `job_runs`/`delivery_failures`.

## Proveedores IA (resiliencia)

- Orden configurable: `AI_PROVIDER_ORDER=openai,azure-openai,anthropic`
- Reintentos exponenciales: `AI_MAX_RETRIES`
- Timeout por request: `AI_TIMEOUT_MS`
- Circuit breaker para aislar proveedores caidos y seguir con fallback.

## Tests y calidad

```bash
npm run lint
npm run test
npm run build
```

Incluye:

- Unit tests backend para servicios criticos
- Integracion backend (auth/promotions)
- Test frontend de componente clave

## Despliegue

### Backend en Railway

1. Crear proyecto Railway y enlazar carpeta `backend`.
2. Provisionar PostgreSQL en Railway.
3. Definir variables del `backend/.env.example`.
4. Railway usara `backend/railway.json`.

### Frontend en Vercel

1. Importar carpeta `frontend` en Vercel.
2. Configurar `NEXT_PUBLIC_API_URL` apuntando al backend Railway (`https://.../api/v1`).
3. Deploy.

## CI/CD automatico (GitHub Actions)

- `ci.yml`: lint + test + build de backend y frontend en cada push/PR.
- `deploy.yml`: despliegue automatico a Railway y Vercel en `main/master`.

Secrets esperados:

- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_ID`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## Supuestos

- Ingesta inicial de fuentes y parseo PDF queda operativa con pipeline y datos preparados para evolucionar (conectores reales por fuente se amplian por configuracion).
- Clasificacion IA usa fallback robusto cuando hay errores de proveedor (timeouts/429).
- Backoffice protegido por rol `admin`.

## Mejoras siguientes

1. Añadir cola distribuida (BullMQ/Redis) para separar workers por tipo de carga.
2. Añadir canal Telegram/email/push real sobre `published_posts`.
3. Añadir observabilidad completa (OpenTelemetry + dashboards + alerting).
4. Endurecer seguridad con rotacion de secretos y politica CSP por entorno.
