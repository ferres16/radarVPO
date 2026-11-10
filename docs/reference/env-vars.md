# Variables de entorno

> Generado por `scripts/generate-reference-docs.mjs`. No editar a mano: ejecuta `npm run docs:reference`.

Nombres detectados en el código (`process.env.X` y `ConfigService.get('X')`). **No se incluyen valores.** *Validada* = declarada en `backend/src/config/env.validation.ts` (el backend no arranca si el formato es inválido). Variables `NEXT_PUBLIC_*` se incrustan en el bundle del navegador: nunca deben contener secretos.

| Variable | Backend | Frontend | Validada | En .env.example | Ficheros |
|---|---|---|---|---|---|
| `ALERTS_TAKE` | sí |  |  |  | `backend:alerts/alerts.service.ts` |
| `ALLOWED_FILE_MIME_TYPES` | sí |  | sí | backend | `backend:storage/file-storage.service.ts` |
| `API_URL` |  | sí |  | frontend | `frontend:app/cursos/[slug]/page.tsx`, `frontend:lib/backend-url.ts`, `frontend:lib/course-media-url.ts` |
| `AWS_ACCESS_KEY_ID` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `AWS_REGION` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `AWS_S3_BUCKET` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `AWS_S3_ENDPOINT` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `AWS_S3_FORCE_PATH_STYLE` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `AWS_S3_PUBLIC_BASE_URL` | sí |  | sí | backend | `backend:storage/s3-storage.service.ts` |
| `AWS_SECRET_ACCESS_KEY` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `BACKEND_PROXY_SECRET` | sí | sí | sí | backend, frontend | `backend:common/guards/client-ip-throttler.guard.ts`, `frontend:lib/backend-proxy-headers.ts`, `frontend:lib/backend-url.ts` |
| `BREVO_ADMIN_EMAIL` | sí |  | sí | backend | `backend:notifications/notifications.service.ts` |
| `BREVO_API_KEY` | sí |  | sí | backend | `backend:notifications/notifications.service.ts` |
| `BREVO_EMAIL_SENDER` | sí |  | sí | backend | `backend:notifications/notifications.service.ts` |
| `BREVO_PRO_ALERTS_ENABLED` | sí |  | sí | backend | `backend:notifications/notifications.service.ts` |
| `BREVO_SMS_SENDER` | sí |  | sí | backend | `backend:notifications/notifications.service.ts` |
| `COOKIE_DOMAIN` | sí |  | sí | backend | `backend:auth/auth.controller.ts` |
| `COOKIE_SAMESITE` | sí |  | sí | backend | `backend:auth/auth.controller.ts` |
| `COOKIE_SECURE` | sí |  | sí | backend | `backend:auth/auth.controller.ts` |
| `CORS_ORIGIN` | sí |  | sí | backend | `backend:main.ts` |
| `COURSE_ASSET_MAX_SIZE_BYTES` | sí |  | sí | backend | `backend:storage/upload-limits.ts` |
| `COURSE_COVER_MAX_SIZE_BYTES` | sí |  | sí | backend | `backend:storage/upload-limits.ts` |
| `CRON_CHECK_PROMOTIONS` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `CRON_DATA_RETENTION` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `CRON_FETCH_DAILY_NEWS` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `CRON_SEND_REMINDERS` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `DATABASE_URL` | sí |  | sí | backend | `backend/prisma.config.ts` |
| `ENABLE_CRONS` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `FRONTEND_URL` | sí |  | sí | backend | `backend:backoffice/backoffice.service.ts`, `backend:billing/billing.service.ts`, `backend:main.ts` |
| `JOBS_ADMIN_TOKEN` | sí |  | sí | backend | `backend:jobs/jobs.controller.ts` |
| `JOB_TIMEZONE` | sí |  | sí | backend | `backend:jobs/jobs.service.ts` |
| `MAX_FILE_SIZE_BYTES` | sí |  | sí | backend | `backend:storage/file-storage.service.ts` |
| `NEWS_CACHE_TTL_SECONDS` | sí |  |  | backend | `backend:news/news.service.ts` |
| `NEWS_COVER_SIGNED_URL_TTL_SECONDS` | sí |  |  |  | `backend:news/news.service.ts` |
| `NEWS_ENABLED` | sí |  | sí | backend | `backend:jobs/jobs.service.ts` |
| `NEWS_RSS_FEEDS` | sí |  | sí | backend | `backend:jobs/rss-news.service.ts` |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_ENABLED` |  | sí |  | frontend | `frontend/next.config.ts`, `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_SLOT_CARD` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_SLOT_INLINE` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_SLOT_MOBILE_STICKY` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR` |  | sí |  | frontend | `frontend:lib/ads.ts` |
| `NEXT_PUBLIC_API_URL` |  | sí |  | backend, frontend | `frontend:app/cursos/[slug]/page.tsx`, `frontend:lib/backend-url.ts`, `frontend:lib/course-media-url.ts` |
| `NEXT_PUBLIC_COURSE_AUTHOR_BIO` |  | sí |  |  | `frontend:lib/offer.ts` |
| `NEXT_PUBLIC_COURSE_AUTHOR_NAME` |  | sí |  |  | `frontend:lib/offer.ts` |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` |  | sí |  | frontend | `frontend:lib/marketing.ts` |
| `NEXT_PUBLIC_GOOGLE_ADS_ID` |  | sí |  | frontend | `frontend:lib/marketing.ts` |
| `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` |  | sí |  | frontend | `frontend:lib/marketing.ts` |
| `NEXT_PUBLIC_LEGAL_ADDRESS` |  | sí |  | frontend | `frontend:lib/legal.ts` |
| `NEXT_PUBLIC_LEGAL_NAME` |  | sí |  | frontend | `frontend:lib/legal.ts` |
| `NEXT_PUBLIC_LEGAL_TAX_ID` |  | sí |  | frontend | `frontend:lib/legal.ts` |
| `NEXT_PUBLIC_META_PIXEL_ID` |  | sí |  | frontend | `frontend:lib/marketing.ts` |
| `NEXT_PUBLIC_PRO_WHATSAPP_NUMBER` |  | sí |  | frontend | `frontend:lib/whatsapp.ts` |
| `NEXT_PUBLIC_PRO_WHATSAPP_URL` |  | sí |  | frontend | `frontend:lib/whatsapp.ts` |
| `NEXT_PUBLIC_SITE_URL` |  | sí |  | frontend | `frontend:lib/seo.ts` |
| `NEXT_PUBLIC_SUPPORT_EMAIL` |  | sí |  | frontend | `frontend:lib/legal.ts` |
| `NODE_ENV` | sí | sí |  | backend | `backend:auth/auth.controller.ts`, `backend:common/filters/all-exceptions.filter.ts`, `backend:main.ts`, `frontend/next.config.ts` +2 |
| `OPENAI_API_KEY` | sí |  | sí | backend | `backend:ai/ai.provider.service.ts` |
| `OPENAI_BASE_URL` | sí |  | sí |  | `backend:ai/ai.provider.service.ts` |
| `OPENAI_IMAGE_MODEL` | sí |  | sí |  | `backend:ai/ai.provider.service.ts` |
| `OPENAI_MODEL` | sí |  | sí | backend | `backend:ai/ai.provider.service.ts` |
| `PORT` | sí |  | sí | backend | `backend:main.ts` |
| `PROMOTION_ASSET_MAX_SIZE_BYTES` | sí |  | sí | backend | `backend:backoffice/backoffice.service.ts`, `backend:storage/upload-limits.ts` |
| `REGISTRE_MAX_PAGES` | sí |  | sí | backend | `backend:jobs/registre-scraper.service.ts` |
| `REGISTRE_MIN_YEAR` | sí |  | sí | backend | `backend:jobs/registre-scraper.service.ts` |
| `REGISTRE_NEWS_URL` | sí |  | sí | backend | `backend:jobs/registre-scraper.service.ts` |
| `RUN_JOBS_ON_BOOTSTRAP` | sí |  |  | backend | `backend:jobs/jobs.service.ts` |
| `S3_ACCESS_KEY_ID` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_BUCKET` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_ENDPOINT` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_FORCE_PATH_STYLE` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_PUBLIC_BASE_URL` | sí |  | sí | backend | `backend:storage/s3-storage.service.ts` |
| `S3_REGION` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_SECRET_ACCESS_KEY` | sí |  | sí | backend | `backend/scripts/cleanup-db.ts`, `backend/scripts/cleanup-s3-assets.ts`, `backend:storage/s3-storage.service.ts` |
| `S3_SIGNED_URL_TTL_SECONDS` | sí |  | sí | backend | `backend:storage/file-storage.service.ts` |
| `SEED_ADMIN_EMAIL` | sí |  |  | backend | `backend/prisma/seed.ts` |
| `SEED_ADMIN_PASSWORD` | sí |  |  | backend | `backend/prisma/seed.ts` |
| `SEED_SAMPLE_DATA` | sí |  |  | backend | `backend/prisma/seed.ts` |
| `SEED_USER_EMAIL` | sí |  |  | backend | `backend/prisma/seed.ts` |
| `SEED_USER_PASSWORD` | sí |  |  | backend | `backend/prisma/seed.ts` |
| `STRIPE_PORTAL_RETURN_URL` | sí |  | sí | backend | `backend:billing/billing.service.ts` |
| `STRIPE_PRO_PRICE_CENTS` | sí |  | sí | backend | `backend:billing/billing.service.ts` |
| `STRIPE_SECRET_KEY` | sí |  | sí | backend | `backend:billing/billing.service.ts` |
| `STRIPE_WEBHOOK_SECRET` | sí |  | sí | backend | `backend:billing/billing.service.ts` |
| `VERCEL` |  | sí |  |  | `frontend:app/layout.tsx` |
