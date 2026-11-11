# Inventario de ficheros

> Generado por `scripts/generate-reference-docs.mjs`. No editar a mano: ejecuta `npm run docs:reference`.

**515** ficheros versionados (`git ls-files`), excluyendo los propios documentos generados en `docs/reference/`.

## Exclusiones

No se inventarían porque no están versionados o se regeneran:

- `node_modules/` (dependencias, ver `package-lock.json`).
- `backend/dist/`, `frontend/.next/` (artefactos de build).
- `.env`, `.env.local` y similares (secretos; solo se versionan los `.env.example`).
- `backend/generated/` / cliente Prisma (se genera con `prisma generate`).
- Coberturas, logs y cachés locales (`coverage/`, `*.log`, `.turbo`).

## Resumen por tipo

| Tipo | Ficheros |
|---|---|
| Componente React | 83 |
| Test automatizado | 57 |
| Utilidad frontend | 55 |
| DTO de validación (class-validator) | 46 |
| Página Next (App Router) | 41 |
| Utilidad backend | 38 |
| Migración SQL (aplicada por `prisma migrate deploy`) | 32 |
| Servicio NestJS (lógica de negocio) | 25 |
| Documentación | 22 |
| Módulo NestJS | 19 |
| Configuración de herramientas | 16 |
| Route handler Next (proxy/servidor) | 16 |
| Controlador HTTP NestJS | 12 |
| Recurso estático público | 11 |
| Script operativo backend | 5 |
| Configuración de despliegue | 4 |
| Guard de autorización / rate limit | 4 |
| Configuración/tests de integración | 4 |
| Componente React de ruta | 3 |
| Pipeline CI/CD | 2 |
| Exclusiones de git | 2 |
| Plantilla de variables de entorno (sin valores reales) | 2 |
| Metadato/SEO generado | 2 |
| Configuración del editor | 1 |
| Configuración de Prisma | 1 |
| Rollback manual de la migración | 1 |
| Bloqueo de proveedor de migraciones Prisma | 1 |
| Esquema de datos (fuente de verdad) | 1 |
| Datos iniciales (seed) de Prisma | 1 |
| Estrategia Passport | 1 |
| Estado especial de ruta Next | 1 |
| Estilos globales | 1 |
| Layout Next | 1 |
| Hook React | 1 |
| Middleware Next (se ejecuta en cada petición) | 1 |
| Tipos compartidos frontend | 1 |
| Script de mantenimiento del repositorio | 1 |

## Listado completo

### `(raíz)` (5)

| Fichero | Tipo |
|---|---|
| `.gitignore` | Exclusiones de git |
| `README.md` | Documentación |
| `package-lock.json` | Configuración de herramientas |
| `package.json` | Configuración de herramientas |
| `vercel.json` | Configuración de despliegue |

### `.cursor` (1)

| Fichero | Tipo |
|---|---|
| `.cursor/settings.json` | Configuración del editor |

### `.github/workflows` (2)

| Fichero | Tipo |
|---|---|
| `.github/workflows/ci.yml` | Pipeline CI/CD |
| `.github/workflows/deploy.yml` | Pipeline CI/CD |

### `backend` (12)

| Fichero | Tipo |
|---|---|
| `backend/.env.example` | Plantilla de variables de entorno (sin valores reales) |
| `backend/.prettierrc` | Configuración de herramientas |
| `backend/Procfile` | Configuración de despliegue |
| `backend/README.md` | Documentación |
| `backend/eslint.config.mjs` | Configuración de herramientas |
| `backend/nest-cli.json` | Configuración de herramientas |
| `backend/package-lock.json` | Configuración de herramientas |
| `backend/package.json` | Configuración de herramientas |
| `backend/prisma.config.ts` | Configuración de Prisma |
| `backend/railway.json` | Configuración de despliegue |
| `backend/tsconfig.build.json` | Configuración de herramientas |
| `backend/tsconfig.json` | Configuración de herramientas |

### `backend/prisma` (2)

| Fichero | Tipo |
|---|---|
| `backend/prisma/schema.prisma` | Esquema de datos (fuente de verdad) |
| `backend/prisma/seed.ts` | Datos iniciales (seed) de Prisma |

### `backend/prisma/migrations` (34)

| Fichero | Tipo |
|---|---|
| `backend/prisma/migrations/0001_init/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/0002_manual_workflow/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/0003_available_units_text/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260422120000_news_automation/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260422153000_promotion_status_refresh/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260503210000_add_courses_and_phone/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260518182123_courses_rebuild/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260522193728_add_last_login_at/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260524120000_add_list_indexes/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260602120000_services_access_and_stripe_links/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260611100000_add_file_assets/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260611113000_promotion_document_editor_metadata/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260611143000_course_cms_blocks_assets/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260615190000_conversion_security_indexes/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260615203000_sale_prices_and_alert_management/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260714120000_user_billing_fields/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20260819220000_password_reset_tokens/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261015120000_commercial_launch/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261020140000_guide_pdf_news_cover_visitors/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261020180000_message_templates_promo_rules/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261020200000_launch_hardening/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261020203000_stripe_event_unique/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261023120000_messaging_prefs_and_templates/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261023180000_enable_live_sales/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261029120000_audit_rv01_rv06/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261029140000_promotion_manual_removal/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261030140000_purchase_consent_and_supply/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261103100000_delivery_logs/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261103110000_enable_pro_sms_alerts/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261105210000_access_tiers_marketing_consent/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261110000000_delivery_log_content/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/20261110120000_audit_indexes/down.sql` | Rollback manual de la migración |
| `backend/prisma/migrations/20261110120000_audit_indexes/migration.sql` | Migración SQL (aplicada por `prisma migrate deploy`) |
| `backend/prisma/migrations/migration_lock.toml` | Bloqueo de proveedor de migraciones Prisma |

### `backend/scripts` (5)

| Fichero | Tipo |
|---|---|
| `backend/scripts/cleanup-db.ts` | Script operativo backend |
| `backend/scripts/cleanup-s3-assets.ts` | Script operativo backend |
| `backend/scripts/db-integrity-check.sql` | Script operativo backend |
| `backend/scripts/generate-today-news.ts` | Script operativo backend |
| `backend/scripts/reset-promotions-and-rescrape.ts` | Script operativo backend |

### `backend/src` (2)

| Fichero | Tipo |
|---|---|
| `backend/src/app.module.ts` | Módulo NestJS |
| `backend/src/main.ts` | Utilidad backend |

### `backend/src/ai` (2)

| Fichero | Tipo |
|---|---|
| `backend/src/ai/ai.module.ts` | Módulo NestJS |
| `backend/src/ai/ai.provider.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/alerts` (3)

| Fichero | Tipo |
|---|---|
| `backend/src/alerts/alerts.controller.ts` | Controlador HTTP NestJS |
| `backend/src/alerts/alerts.module.ts` | Módulo NestJS |
| `backend/src/alerts/alerts.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/auth` (18)

| Fichero | Tipo |
|---|---|
| `backend/src/auth/__tests__/password-reset.util.unit-spec.ts` | Test automatizado |
| `backend/src/auth/__tests__/refresh-token.util.unit-spec.ts` | Test automatizado |
| `backend/src/auth/auth.controller.ts` | Controlador HTTP NestJS |
| `backend/src/auth/auth.module.ts` | Módulo NestJS |
| `backend/src/auth/auth.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/auth/dto/forgot-password.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/login.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/refresh.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/register.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/reset-password.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/update-unverified-email.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/dto/verify-email.dto.ts` | DTO de validación (class-validator) |
| `backend/src/auth/email-verification.util.ts` | Utilidad backend |
| `backend/src/auth/jwt-auth.guard.ts` | Guard de autorización / rate limit |
| `backend/src/auth/jwt.strategy.ts` | Estrategia Passport |
| `backend/src/auth/optional-jwt-auth.guard.ts` | Guard de autorización / rate limit |
| `backend/src/auth/password-reset.util.ts` | Utilidad backend |
| `backend/src/auth/refresh-token.util.ts` | Utilidad backend |

### `backend/src/backoffice` (37)

| Fichero | Tipo |
|---|---|
| `backend/src/backoffice/__tests__/course-commercial-fields.unit-spec.ts` | Test automatizado |
| `backend/src/backoffice/backoffice.controller.ts` | Controlador HTTP NestJS |
| `backend/src/backoffice/backoffice.module.ts` | Módulo NestJS |
| `backend/src/backoffice/backoffice.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/backoffice/course-commercial-fields.ts` | Utilidad backend |
| `backend/src/backoffice/dto/create-course-access-rule.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-course-content-block.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-course-lesson.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-course-module.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-course.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-news-item.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/create-promotion.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/delivery-ops.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/import-units-from-paste.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/list-backoffice.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/preview-pro-notification.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/reorder-course-items.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/reorder-units.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/simulate-pro-alerts.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-access.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-backoffice-news-item.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-commerce-settings.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-course-access-rule.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-course-content-block.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-course-lesson.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-course-module.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-course.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-message-template.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-promo-rule.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-promotion-document.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-promotion-status.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-promotion.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/update-user.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/upload-course-asset.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/upload-course-block-asset.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/upload-document.dto.ts` | DTO de validación (class-validator) |
| `backend/src/backoffice/dto/upsert-unit.dto.ts` | DTO de validación (class-validator) |

### `backend/src/billing` (9)

| Fichero | Tipo |
|---|---|
| `backend/src/billing/__tests__/contract-consent.unit-spec.ts` | Test automatizado |
| `backend/src/billing/__tests__/stripe-fulfillment.unit-spec.ts` | Test automatizado |
| `backend/src/billing/billing.controller.ts` | Controlador HTTP NestJS |
| `backend/src/billing/billing.module.ts` | Módulo NestJS |
| `backend/src/billing/billing.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/billing/contract-consent.ts` | Utilidad backend |
| `backend/src/billing/dto/content-supply.dto.ts` | DTO de validación (class-validator) |
| `backend/src/billing/dto/create-checkout.dto.ts` | DTO de validación (class-validator) |
| `backend/src/billing/stripe-fulfillment.ts` | Utilidad backend |

### `backend/src/commerce` (6)

| Fichero | Tipo |
|---|---|
| `backend/src/commerce/commerce.module.ts` | Módulo NestJS |
| `backend/src/commerce/commerce.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/commerce/commerce.types.ts` | Utilidad backend |
| `backend/src/commerce/message-templates.defaults.ts` | Utilidad backend |
| `backend/src/commerce/message-templates.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/commerce/promo-rules.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/common` (31)

| Fichero | Tipo |
|---|---|
| `backend/src/common/__tests__/access-tier.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/app-environment.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/client-ip-throttler.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/pro-alert-preferences.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/promotion-content-filters.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/public-courses.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/public-site-url.unit-spec.ts` | Test automatizado |
| `backend/src/common/__tests__/request-origin.unit-spec.ts` | Test automatizado |
| `backend/src/common/access-tier.ts` | Utilidad backend |
| `backend/src/common/app-environment.ts` | Utilidad backend |
| `backend/src/common/decorators/current-user.decorator.ts` | Utilidad backend |
| `backend/src/common/decorators/roles.decorator.ts` | Utilidad backend |
| `backend/src/common/filters/all-exceptions.filter.ts` | Utilidad backend |
| `backend/src/common/guards/client-ip-throttler.guard.ts` | Guard de autorización / rate limit |
| `backend/src/common/guards/roles.guard.ts` | Guard de autorización / rate limit |
| `backend/src/common/guide-vpo.ts` | Utilidad backend |
| `backend/src/common/interceptors/request-logging.interceptor.ts` | Utilidad backend |
| `backend/src/common/marketing-consent.ts` | Utilidad backend |
| `backend/src/common/municipalities/catalunya-municipalities.ts` | Utilidad backend |
| `backend/src/common/municipalities/catalunya-municipalities.unit-spec.ts` | Test automatizado |
| `backend/src/common/news/source-grounding.ts` | Utilidad backend |
| `backend/src/common/news/source-grounding.unit-spec.ts` | Test automatizado |
| `backend/src/common/pro-access/pro-access.module.ts` | Módulo NestJS |
| `backend/src/common/pro-access/pro-access.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/common/pro-access/pro-access.types.ts` | Utilidad backend |
| `backend/src/common/pro-alert-preferences.ts` | Utilidad backend |
| `backend/src/common/promotion-content-filters.ts` | Utilidad backend |
| `backend/src/common/promotion-view.util.ts` | Utilidad backend |
| `backend/src/common/public-courses.ts` | Utilidad backend |
| `backend/src/common/public-site-url.ts` | Utilidad backend |
| `backend/src/common/request-origin.ts` | Utilidad backend |

### `backend/src/config` (1)

| Fichero | Tipo |
|---|---|
| `backend/src/config/env.validation.ts` | Utilidad backend |

### `backend/src/courses` (3)

| Fichero | Tipo |
|---|---|
| `backend/src/courses/courses.controller.ts` | Controlador HTTP NestJS |
| `backend/src/courses/courses.module.ts` | Módulo NestJS |
| `backend/src/courses/courses.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/health` (2)

| Fichero | Tipo |
|---|---|
| `backend/src/health/health.controller.ts` | Controlador HTTP NestJS |
| `backend/src/health/health.module.ts` | Módulo NestJS |

### `backend/src/jobs` (9)

| Fichero | Tipo |
|---|---|
| `backend/src/jobs/data-retention.ts` | Utilidad backend |
| `backend/src/jobs/hash.util.ts` | Utilidad backend |
| `backend/src/jobs/jobs.controller.ts` | Controlador HTTP NestJS |
| `backend/src/jobs/jobs.module.ts` | Módulo NestJS |
| `backend/src/jobs/jobs.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/jobs/news-automation.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/jobs/pdf-ocr.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/jobs/registre-scraper.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/jobs/rss-news.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/metrics` (3)

| Fichero | Tipo |
|---|---|
| `backend/src/metrics/metrics.controller.ts` | Controlador HTTP NestJS |
| `backend/src/metrics/metrics.module.ts` | Módulo NestJS |
| `backend/src/metrics/metrics.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/news` (5)

| Fichero | Tipo |
|---|---|
| `backend/src/news/dto/list-news.dto.ts` | DTO de validación (class-validator) |
| `backend/src/news/news-cover.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/news/news.controller.ts` | Controlador HTTP NestJS |
| `backend/src/news/news.module.ts` | Módulo NestJS |
| `backend/src/news/news.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/notifications` (16)

| Fichero | Tipo |
|---|---|
| `backend/src/notifications/__tests__/admin-emails.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/__tests__/message-vars.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/__tests__/pro-notify-copy.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/__tests__/pro-notify.util.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/__tests__/short-link.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/__tests__/sms-content.unit-spec.ts` | Test automatizado |
| `backend/src/notifications/admin-emails.ts` | Utilidad backend |
| `backend/src/notifications/message-vars.ts` | Utilidad backend |
| `backend/src/notifications/notifications.module.ts` | Módulo NestJS |
| `backend/src/notifications/notifications.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/notifications/phone-normalize.spec.ts` | Test automatizado |
| `backend/src/notifications/phone-normalize.ts` | Utilidad backend |
| `backend/src/notifications/pro-notify-copy.ts` | Utilidad backend |
| `backend/src/notifications/pro-notify.util.ts` | Utilidad backend |
| `backend/src/notifications/short-link.ts` | Utilidad backend |
| `backend/src/notifications/sms-content.ts` | Utilidad backend |

### `backend/src/prisma` (2)

| Fichero | Tipo |
|---|---|
| `backend/src/prisma/prisma.module.ts` | Módulo NestJS |
| `backend/src/prisma/prisma.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/promotions` (6)

| Fichero | Tipo |
|---|---|
| `backend/src/promotions/dto/list-promotions.dto.ts` | DTO de validación (class-validator) |
| `backend/src/promotions/dto/update-favorite.dto.ts` | DTO de validación (class-validator) |
| `backend/src/promotions/favorite-checklist.ts` | Utilidad backend |
| `backend/src/promotions/promotions.controller.ts` | Controlador HTTP NestJS |
| `backend/src/promotions/promotions.module.ts` | Módulo NestJS |
| `backend/src/promotions/promotions.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/storage` (4)

| Fichero | Tipo |
|---|---|
| `backend/src/storage/file-storage.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/storage/s3-storage.service.ts` | Servicio NestJS (lógica de negocio) |
| `backend/src/storage/storage.module.ts` | Módulo NestJS |
| `backend/src/storage/upload-limits.ts` | Utilidad backend |

### `backend/src/users` (4)

| Fichero | Tipo |
|---|---|
| `backend/src/users/dto/update-profile.dto.ts` | DTO de validación (class-validator) |
| `backend/src/users/users.controller.ts` | Controlador HTTP NestJS |
| `backend/src/users/users.module.ts` | Módulo NestJS |
| `backend/src/users/users.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/src/waitlist` (4)

| Fichero | Tipo |
|---|---|
| `backend/src/waitlist/dto/create-waitlist-lead.dto.ts` | DTO de validación (class-validator) |
| `backend/src/waitlist/waitlist.controller.ts` | Controlador HTTP NestJS |
| `backend/src/waitlist/waitlist.module.ts` | Módulo NestJS |
| `backend/src/waitlist/waitlist.service.ts` | Servicio NestJS (lógica de negocio) |

### `backend/test` (9)

| Fichero | Tipo |
|---|---|
| `backend/test/app.e2e-spec.ts` | Configuración/tests de integración |
| `backend/test/auth-promotions.integration-spec.ts` | Test automatizado |
| `backend/test/auth.service.unit-spec.ts` | Test automatizado |
| `backend/test/data-lifecycle.integration-spec.ts` | Test automatizado |
| `backend/test/jest-e2e.json` | Configuración/tests de integración |
| `backend/test/jest-integration.json` | Configuración/tests de integración |
| `backend/test/jest-unit.json` | Configuración/tests de integración |
| `backend/test/pdf-ocr.service.unit-spec.ts` | Test automatizado |
| `backend/test/promotions.service.unit-spec.ts` | Test automatizado |

### `docs` (15)

| Fichero | Tipo |
|---|---|
| `docs/README.md` | Documentación |
| `docs/ads-meta-diagnosis.md` | Documentación |
| `docs/adsense-getting-ready.md` | Documentación |
| `docs/architecture.md` | Documentación |
| `docs/auditoria-rv01-rv06-2026-10-29.md` | Documentación |
| `docs/checkout-thankyou-consent.md` | Documentación |
| `docs/estrategia-lanzamiento.md` | Documentación |
| `docs/flows.md` | Documentación |
| `docs/integrations.md` | Documentación |
| `docs/legal-privacy.md` | Documentación |
| `docs/operations.md` | Documentación |
| `docs/performance.md` | Documentación |
| `docs/security-audit.md` | Documentación |
| `docs/staging.md` | Documentación |
| `docs/ux-ui-audit.md` | Documentación |

### `docs/research` (2)

| Fichero | Tipo |
|---|---|
| `docs/research/01-objectiullar-registre.md` | Documentación |
| `docs/research/02-oestum-elpages-cursos.md` | Documentación |

### `frontend` (13)

| Fichero | Tipo |
|---|---|
| `frontend/.env.example` | Plantilla de variables de entorno (sin valores reales) |
| `frontend/.gitignore` | Exclusiones de git |
| `frontend/AGENTS.md` | Documentación |
| `frontend/CLAUDE.md` | Documentación |
| `frontend/README.md` | Documentación |
| `frontend/eslint.config.mjs` | Configuración de herramientas |
| `frontend/next.config.ts` | Configuración de herramientas |
| `frontend/package.json` | Configuración de herramientas |
| `frontend/postcss.config.mjs` | Configuración de herramientas |
| `frontend/tsconfig.json` | Configuración de herramientas |
| `frontend/vercel.json` | Configuración de despliegue |
| `frontend/vitest.config.ts` | Configuración de herramientas |
| `frontend/vitest.setup.ts` | Configuración de herramientas |

### `frontend/public` (9)

| Fichero | Tipo |
|---|---|
| `frontend/public/ads.txt` | Recurso estático público |
| `frontend/public/favicon.png` | Recurso estático público |
| `frontend/public/file.svg` | Recurso estático público |
| `frontend/public/globe.svg` | Recurso estático público |
| `frontend/public/logo-radar-vpo.png` | Recurso estático público |
| `frontend/public/next.svg` | Recurso estático público |
| `frontend/public/pro-product-v2.png` | Recurso estático público |
| `frontend/public/vercel.svg` | Recurso estático público |
| `frontend/public/window.svg` | Recurso estático público |

### `frontend/public/covers` (1)

| Fichero | Tipo |
|---|---|
| `frontend/public/covers/guia-vpo.png` | Recurso estático público |

### `frontend/src` (1)

| Fichero | Tipo |
|---|---|
| `frontend/src/middleware.ts` | Middleware Next (se ejecuta en cada petición) |

### `frontend/src/app` (66)

| Fichero | Tipo |
|---|---|
| `frontend/src/app/account/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/access/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/alerts/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/cancellations/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/commerce/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/courses/[courseId]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/courses/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/files/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/message-templates/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/news/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/promotions/[id]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/promotions/create-promotion-form.tsx` | Componente React de ruta |
| `frontend/src/app/admin/promotions/delete-promotion-button.tsx` | Componente React de ruta |
| `frontend/src/app/admin/promotions/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/services/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/sms/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/users/page.tsx` | Página Next (App Router) |
| `frontend/src/app/admin/waitlist/page.tsx` | Página Next (App Router) |
| `frontend/src/app/ads.txt/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/alerts/page.tsx` | Página Next (App Router) |
| `frontend/src/app/api/auth/forgot-password/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/login/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/logout/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/refresh/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/register/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/resend-verification/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/reset-password/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/update-unverified-email/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/auth/verify-email/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/backend/[...path]/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/course-covers/[slug]/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/course-media/[assetId]/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/metrics/visit/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/api/promotion-pdf/[promotionId]/[documentId]/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/aviso-legal/page.tsx` | Página Next (App Router) |
| `frontend/src/app/checkout/page.tsx` | Página Next (App Router) |
| `frontend/src/app/condiciones/page.tsx` | Página Next (App Router) |
| `frontend/src/app/contacto/page.tsx` | Página Next (App Router) |
| `frontend/src/app/cookies/page.tsx` | Página Next (App Router) |
| `frontend/src/app/cursos/[slug]/[lessonSlug]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/cursos/[slug]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/cursos/page.tsx` | Página Next (App Router) |
| `frontend/src/app/dashboard/loading.tsx` | Estado especial de ruta Next |
| `frontend/src/app/favicon.ico` | Recurso estático público |
| `frontend/src/app/forgot-password/page.tsx` | Página Next (App Router) |
| `frontend/src/app/globals.css` | Estilos globales |
| `frontend/src/app/gracias/gracias-client.tsx` | Componente React de ruta |
| `frontend/src/app/gracias/page.tsx` | Página Next (App Router) |
| `frontend/src/app/layout.tsx` | Layout Next |
| `frontend/src/app/login/page.tsx` | Página Next (App Router) |
| `frontend/src/app/mi-espacio/page.tsx` | Página Next (App Router) |
| `frontend/src/app/news/[id]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/news/page.tsx` | Página Next (App Router) |
| `frontend/src/app/p/[code]/route.ts` | Route handler Next (proxy/servidor) |
| `frontend/src/app/page.tsx` | Página Next (App Router) |
| `frontend/src/app/privacidad/page.tsx` | Página Next (App Router) |
| `frontend/src/app/pro/page.tsx` | Página Next (App Router) |
| `frontend/src/app/promotions/[id]/page.tsx` | Página Next (App Router) |
| `frontend/src/app/promotions/page.tsx` | Página Next (App Router) |
| `frontend/src/app/register/page.tsx` | Página Next (App Router) |
| `frontend/src/app/reset-password/page.tsx` | Página Next (App Router) |
| `frontend/src/app/robots.ts` | Metadato/SEO generado |
| `frontend/src/app/services/page.tsx` | Página Next (App Router) |
| `frontend/src/app/sitemap.ts` | Metadato/SEO generado |
| `frontend/src/app/verify-email/page.tsx` | Página Next (App Router) |

### `frontend/src/components` (84)

| Fichero | Tipo |
|---|---|
| `frontend/src/components/__tests__/promotion-card.test.tsx` | Test automatizado |
| `frontend/src/components/admin-nav.tsx` | Componente React |
| `frontend/src/components/admin/message-preview.tsx` | Componente React |
| `frontend/src/components/admin/template-previews.tsx` | Componente React |
| `frontend/src/components/ads/ad-slot.tsx` | Componente React |
| `frontend/src/components/ads/adsense-site-verification.tsx` | Componente React |
| `frontend/src/components/ads/index.ts` | Componente React |
| `frontend/src/components/ads/inline-ad-card.tsx` | Componente React |
| `frontend/src/components/ads/mobile-sticky-ad.tsx` | Componente React |
| `frontend/src/components/ads/public-ad-frame.tsx` | Componente React |
| `frontend/src/components/ads/sidebar-ads.tsx` | Componente React |
| `frontend/src/components/alert-countdown-badge.tsx` | Componente React |
| `frontend/src/components/checkout/checkout-panel.tsx` | Componente React |
| `frontend/src/components/checkout/course-checkout-banner.tsx` | Componente React |
| `frontend/src/components/collapse-panel.tsx` | Componente React |
| `frontend/src/components/consent/consent-provider.tsx` | Componente React |
| `frontend/src/components/consent/consented-scripts.tsx` | Componente React |
| `frontend/src/components/consent/cookie-banner.tsx` | Componente React |
| `frontend/src/components/conversion/alerts-pro-cta-band.tsx` | Componente React |
| `frontend/src/components/conversion/featured-course-spotlight.tsx` | Componente React |
| `frontend/src/components/conversion/guide-sample.tsx` | Componente React |
| `frontend/src/components/conversion/guide-vpo-outline.tsx` | Componente React |
| `frontend/src/components/conversion/home-faq.tsx` | Componente React |
| `frontend/src/components/conversion/home-offer-strip.tsx` | Componente React |
| `frontend/src/components/conversion/home-pro-ctas.tsx` | Componente React |
| `frontend/src/components/conversion/notify-preview.tsx` | Componente React |
| `frontend/src/components/conversion/page-view-tracker.tsx` | Componente React |
| `frontend/src/components/conversion/pdf-viewer-demo.tsx` | Componente React |
| `frontend/src/components/conversion/promotions-explorer.tsx` | Componente React |
| `frontend/src/components/conversion/proof-stats.tsx` | Componente React |
| `frontend/src/components/conversion/public-shell.tsx` | Componente React |
| `frontend/src/components/conversion/register-promo.tsx` | Componente React |
| `frontend/src/components/conversion/space-demo.tsx` | Componente React |
| `frontend/src/components/conversion/visit-tracker.tsx` | Componente React |
| `frontend/src/components/course-access.tsx` | Componente React |
| `frontend/src/components/course-block-editor.tsx` | Componente React |
| `frontend/src/components/course-block-renderer.tsx` | Componente React |
| `frontend/src/components/course-cover-image.tsx` | Componente React |
| `frontend/src/components/course-hosted-video-player.tsx` | Componente React |
| `frontend/src/components/course-hosted-video-view.tsx` | Componente React |
| `frontend/src/components/course-hub-progress.tsx` | Componente React |
| `frontend/src/components/course-hub-section.tsx` | Componente React |
| `frontend/src/components/course-lesson-editor.tsx` | Componente React |
| `frontend/src/components/course-module-index.tsx` | Componente React |
| `frontend/src/components/course-product-card.tsx` | Componente React |
| `frontend/src/components/course-public-index.tsx` | Componente React |
| `frontend/src/components/course-sticky-buy-bar.tsx` | Componente React |
| `frontend/src/components/course-tiptap-renderer.tsx` | Componente React |
| `frontend/src/components/design-system.tsx` | Componente React |
| `frontend/src/components/empty-state.tsx` | Componente React |
| `frontend/src/components/environment-badge.tsx` | Componente React |
| `frontend/src/components/guide-pdf-viewer.tsx` | Componente React |
| `frontend/src/components/legal-document.tsx` | Componente React |
| `frontend/src/components/mobile-nav.tsx` | Componente React |
| `frontend/src/components/motion-primitives.tsx` | Componente React |
| `frontend/src/components/my-space/saved-promotion-item.tsx` | Componente React |
| `frontend/src/components/news-card.tsx` | Componente React |
| `frontend/src/components/pdf-viewer/promotion-pdf-viewer.tsx` | Componente React |
| `frontend/src/components/pro-access-provider.tsx` | Componente React |
| `frontend/src/components/pro-comparison.tsx` | Componente React |
| `frontend/src/components/pro/pro-cta.tsx` | Componente React |
| `frontend/src/components/pro/pro-status-card.tsx` | Componente React |
| `frontend/src/components/pro/pro-sticky-cta.tsx` | Componente React |
| `frontend/src/components/profile-card.tsx` | Componente React |
| `frontend/src/components/profile/account-management-section.tsx` | Componente React |
| `frontend/src/components/profile/email-verification-banner.tsx` | Componente React |
| `frontend/src/components/profile/empty-state.tsx` | Componente React |
| `frontend/src/components/profile/my-courses-section.tsx` | Componente React |
| `frontend/src/components/profile/personal-info-section.tsx` | Componente React |
| `frontend/src/components/profile/profile-header.tsx` | Componente React |
| `frontend/src/components/promotion-card.tsx` | Componente React |
| `frontend/src/components/promotion-locked-action.tsx` | Componente React |
| `frontend/src/components/radar-visual.tsx` | Componente React |
| `frontend/src/components/saas/alert-timeline.tsx` | Componente React |
| `frontend/src/components/saas/filter-chips.tsx` | Componente React |
| `frontend/src/components/saas/horizontal-rail.tsx` | Componente React |
| `frontend/src/components/save-promotion-button.tsx` | Componente React |
| `frontend/src/components/site-footer.tsx` | Componente React |
| `frontend/src/components/skeleton-card.tsx` | Componente React |
| `frontend/src/components/status-pill.tsx` | Componente React |
| `frontend/src/components/structured-data.tsx` | Componente React |
| `frontend/src/components/top-nav.tsx` | Componente React |
| `frontend/src/components/tracked-link.tsx` | Componente React |
| `frontend/src/components/waitlist-form.tsx` | Componente React |

### `frontend/src/hooks` (1)

| Fichero | Tipo |
|---|---|
| `frontend/src/hooks/use-pdf-fullscreen.ts` | Hook React |

### `frontend/src/lib` (84)

| Fichero | Tipo |
|---|---|
| `frontend/src/lib/__tests__/api-auth.test.ts` | Test automatizado |
| `frontend/src/lib/__tests__/backend-proxy-headers.test.ts` | Test automatizado |
| `frontend/src/lib/__tests__/course-access-targets.test.ts` | Test automatizado |
| `frontend/src/lib/__tests__/course-lesson-resources.test.ts` | Test automatizado |
| `frontend/src/lib/access-tier.ts` | Utilidad frontend |
| `frontend/src/lib/ads-csp.ts` | Utilidad frontend |
| `frontend/src/lib/ads.test.ts` | Test automatizado |
| `frontend/src/lib/ads.ts` | Utilidad frontend |
| `frontend/src/lib/alert-countdown.ts` | Utilidad frontend |
| `frontend/src/lib/alert-municipality.test.ts` | Test automatizado |
| `frontend/src/lib/alert-municipality.ts` | Utilidad frontend |
| `frontend/src/lib/alert-title.test.ts` | Test automatizado |
| `frontend/src/lib/alert-title.ts` | Utilidad frontend |
| `frontend/src/lib/analytics.ts` | Utilidad frontend |
| `frontend/src/lib/api.ts` | Utilidad frontend |
| `frontend/src/lib/app-env.ts` | Utilidad frontend |
| `frontend/src/lib/auth-cookies.ts` | Utilidad frontend |
| `frontend/src/lib/backend-proxy-headers.test.ts` | Test automatizado |
| `frontend/src/lib/backend-proxy-headers.ts` | Utilidad frontend |
| `frontend/src/lib/backend-proxy-paths.test.ts` | Test automatizado |
| `frontend/src/lib/backend-proxy-paths.ts` | Utilidad frontend |
| `frontend/src/lib/backend-url.ts` | Utilidad frontend |
| `frontend/src/lib/catalog-stats.test.ts` | Test automatizado |
| `frontend/src/lib/catalog-stats.ts` | Utilidad frontend |
| `frontend/src/lib/checkout-url.ts` | Utilidad frontend |
| `frontend/src/lib/consent.test.ts` | Test automatizado |
| `frontend/src/lib/consent.ts` | Utilidad frontend |
| `frontend/src/lib/contract-consent.test.ts` | Test automatizado |
| `frontend/src/lib/contract-consent.ts` | Utilidad frontend |
| `frontend/src/lib/conversion-pixels.ts` | Utilidad frontend |
| `frontend/src/lib/conversion.ts` | Utilidad frontend |
| `frontend/src/lib/course-access-targets.ts` | Utilidad frontend |
| `frontend/src/lib/course-hosted-video.ts` | Utilidad frontend |
| `frontend/src/lib/course-lesson-resources.ts` | Utilidad frontend |
| `frontend/src/lib/course-media-url.test.ts` | Test automatizado |
| `frontend/src/lib/course-media-url.ts` | Utilidad frontend |
| `frontend/src/lib/guide-reading-position.test.ts` | Test automatizado |
| `frontend/src/lib/guide-reading-position.ts` | Utilidad frontend |
| `frontend/src/lib/guide-sample-pages.ts` | Utilidad frontend |
| `frontend/src/lib/guide-vpo.test.ts` | Test automatizado |
| `frontend/src/lib/guide-vpo.ts` | Utilidad frontend |
| `frontend/src/lib/legal.ts` | Utilidad frontend |
| `frontend/src/lib/marketing-consent.ts` | Utilidad frontend |
| `frontend/src/lib/marketing-csp.ts` | Utilidad frontend |
| `frontend/src/lib/marketing.test.ts` | Test automatizado |
| `frontend/src/lib/marketing.ts` | Utilidad frontend |
| `frontend/src/lib/municipalities.test.ts` | Test automatizado |
| `frontend/src/lib/municipalities.ts` | Utilidad frontend |
| `frontend/src/lib/my-space.test.ts` | Test automatizado |
| `frontend/src/lib/my-space.ts` | Utilidad frontend |
| `frontend/src/lib/navigation.ts` | Utilidad frontend |
| `frontend/src/lib/news-source.test.ts` | Test automatizado |
| `frontend/src/lib/news-source.ts` | Utilidad frontend |
| `frontend/src/lib/offer-checkout.test.ts` | Test automatizado |
| `frontend/src/lib/offer.ts` | Utilidad frontend |
| `frontend/src/lib/owned-courses.ts` | Utilidad frontend |
| `frontend/src/lib/pdf-page-links.test.ts` | Test automatizado |
| `frontend/src/lib/pdf-page-links.ts` | Utilidad frontend |
| `frontend/src/lib/phone.test.ts` | Test automatizado |
| `frontend/src/lib/phone.ts` | Utilidad frontend |
| `frontend/src/lib/pro-access.ts` | Utilidad frontend |
| `frontend/src/lib/pro-notify-preview.test.ts` | Test automatizado |
| `frontend/src/lib/pro-notify-preview.ts` | Utilidad frontend |
| `frontend/src/lib/pro.ts` | Utilidad frontend |
| `frontend/src/lib/promotion-access.ts` | Utilidad frontend |
| `frontend/src/lib/promotion-content-filters.ts` | Utilidad frontend |
| `frontend/src/lib/promotion-documents.test.ts` | Test automatizado |
| `frontend/src/lib/promotion-documents.ts` | Utilidad frontend |
| `frontend/src/lib/promotion-json-import.ts` | Utilidad frontend |
| `frontend/src/lib/public-courses.test.ts` | Test automatizado |
| `frontend/src/lib/public-courses.ts` | Utilidad frontend |
| `frontend/src/lib/public-promotions.test.ts` | Test automatizado |
| `frontend/src/lib/public-promotions.ts` | Utilidad frontend |
| `frontend/src/lib/register-intent.test.ts` | Test automatizado |
| `frontend/src/lib/register-intent.ts` | Utilidad frontend |
| `frontend/src/lib/register-promo.ts` | Utilidad frontend |
| `frontend/src/lib/safe-media-url.test.ts` | Test automatizado |
| `frontend/src/lib/safe-media-url.ts` | Utilidad frontend |
| `frontend/src/lib/safe-next.ts` | Utilidad frontend |
| `frontend/src/lib/safe-remote-url.test.ts` | Test automatizado |
| `frontend/src/lib/safe-remote-url.ts` | Utilidad frontend |
| `frontend/src/lib/seo.ts` | Utilidad frontend |
| `frontend/src/lib/session-marker.ts` | Utilidad frontend |
| `frontend/src/lib/whatsapp.ts` | Utilidad frontend |

### `frontend/src/types` (1)

| Fichero | Tipo |
|---|---|
| `frontend/src/types/index.ts` | Tipos compartidos frontend |

### `scripts` (1)

| Fichero | Tipo |
|---|---|
| `scripts/generate-reference-docs.mjs` | Script de mantenimiento del repositorio |

