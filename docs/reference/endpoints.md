# Inventario de endpoints

> Generado por `scripts/generate-reference-docs.mjs`. No editar a mano: ejecuta `npm run docs:reference`.

Backend NestJS: **129** rutas. Frontend (route handlers Next): **20**. Páginas: **41**.

Leyenda de autenticación: *Público* sin sesión; *Opcional* el resultado depende del nivel de acceso; *JWT* cookie `access_token` o `Authorization: Bearer` con sesión activa en BD; *rol admin* además requiere `role=admin` leído de BD en cada petición.

Los límites "global 60/min" son por IP real del visitante (ver `docs/operations.md#rate-limit`).

## Backend (`/api/v1`)

| Método | Ruta | Autenticación | Rate limit | Handler | Fichero |
|---|---|---|---|---|---|
| GET | `/api/v1/alerts/upcoming` | Opcional (JWT) | global 60/min | `upcoming` | `alerts/alerts.controller.ts` |
| POST | `/api/v1/auth/forgot-password` | Público | 3 / minutes(60) | `forgotPassword` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/login` | Público | 5 / seconds(60) | `login` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/logout` | Público | 10 / seconds(60) | `logout` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/refresh` | Público | 30 / seconds(60) | `refresh` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/register` | Público | 3 / minutes(60) | `register` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/resend-verification` | JWT | 3 / minutes(10) | `resendVerification` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/reset-password` | Público | 5 / seconds(60) | `resetPassword` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/update-unverified-email` | JWT | 5 / minutes(10) | `updateUnverifiedEmail` | `auth/auth.controller.ts` |
| POST | `/api/v1/auth/verify-email` | Público | 10 / seconds(60) | `verifyEmail` | `auth/auth.controller.ts` |
| GET | `/api/v1/backoffice/access/users` | JWT + rol admin | global 60/min | `listAccessUsers` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/access/users/:id` | JWT + rol admin | global 60/min | `getAccessUser` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/access/users/:id/courses/:courseId` | JWT + rol admin | global 60/min | `updateCourseAccess` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/access/users/:id/services/:serviceId` | JWT + rol admin | global 60/min | `updateServiceAccess` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/cancellations` | JWT + rol admin | global 60/min | `listCancellationRequests` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/cancellations/:id/process` | JWT + rol admin | global 60/min | `processCancellationRequest` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/commerce` | JWT + rol admin | global 60/min | `getCommerceSettings` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/commerce` | JWT + rol admin | global 60/min | `updateCommerceSettings` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/courses` | JWT + rol admin | global 60/min | `listCourses` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses` | JWT + rol admin | global 60/min | `createCourse` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/:id` | JWT + rol admin | global 60/min | `deleteCourse` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/courses/:id` | JWT + rol admin | global 60/min | `updateCourse` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/:id/access-rules` | JWT + rol admin | global 60/min | `createCourseAccessRule` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/:id/cover/upload` | JWT + rol admin | global 60/min | `uploadCourseCover` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/:id/guide-pdf/upload` | JWT + rol admin | global 60/min | `uploadCourseGuidePdf` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/:id/modules` | JWT + rol admin | global 60/min | `createCourseModule` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/:id/modules/reorder` | JWT + rol admin | global 60/min | `reorderCourseModules` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/access-rules/:ruleId` | JWT + rol admin | global 60/min | `deleteCourseAccessRule` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/courses/access-rules/:ruleId` | JWT + rol admin | global 60/min | `updateCourseAccessRule` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/assets/:assetId` | JWT + rol admin | global 60/min | `deleteCourseAsset` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/blocks/:blockId` | JWT + rol admin | global 60/min | `deleteCourseContentBlock` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/courses/blocks/:blockId` | JWT + rol admin | global 60/min | `updateCourseContentBlock` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/blocks/:blockId/assets/upload` | JWT + rol admin | global 60/min | `uploadCourseBlockAsset` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/lessons/:lessonId` | JWT + rol admin | global 60/min | `deleteCourseLesson` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/courses/lessons/:lessonId` | JWT + rol admin | global 60/min | `updateCourseLesson` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/lessons/:lessonId/blocks` | JWT + rol admin | global 60/min | `createCourseContentBlock` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/lessons/:lessonId/blocks/reorder` | JWT + rol admin | global 60/min | `reorderCourseContentBlocks` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/lessons/:lessonId/resources/upload` | JWT + rol admin | global 60/min | `uploadCourseResource` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/modules/:moduleId` | JWT + rol admin | global 60/min | `deleteCourseModule` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/courses/modules/:moduleId` | JWT + rol admin | global 60/min | `updateCourseModule` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/modules/:moduleId/lessons` | JWT + rol admin | global 60/min | `createCourseLesson` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/courses/modules/:moduleId/lessons/reorder` | JWT + rol admin | global 60/min | `reorderCourseLessons` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/courses/resources/:resourceId` | JWT + rol admin | global 60/min | `deleteCourseResource` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/failures` | JWT + rol admin | global 60/min | `failures` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/files` | JWT + rol admin | global 60/min | `listFiles` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/files/:id/retry-delete` | JWT + rol admin | global 60/min | `retryFileDeletion` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/files/entity/:entityType/:entityId` | JWT + rol admin | global 60/min | `listFilesForEntity` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/jobs` | JWT + rol admin | global 60/min | `jobs` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/message-templates` | JWT + rol admin | global 60/min | `listMessageTemplates` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/message-templates/:key` | JWT + rol admin | global 60/min | `updateMessageTemplate` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/message-templates/:key/reset` | JWT + rol admin | global 60/min | `resetMessageTemplate` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/message-templates/preview` | JWT + rol admin | global 60/min | `previewMessageTemplates` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/news` | JWT + rol admin | global 60/min | `listNews` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/news` | JWT + rol admin | global 60/min | `createNews` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/news/:id` | JWT + rol admin | global 60/min | `deleteNews` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/news/:id` | JWT + rol admin | global 60/min | `updateNews` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/news/backfill-covers` | JWT + rol admin | global 60/min | `backfillNewsCovers` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/news/generate-today` | JWT + rol admin | global 60/min | `generateTodayNews` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/notifications/pro-alerts/dispatch` | JWT + rol admin | global 60/min | `dispatchProAlertNotifications` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/notifications/pro-alerts/preview` | JWT + rol admin | global 60/min | `previewProNotification` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/notifications/pro-alerts/simulate` | JWT + rol admin | global 60/min | `simulateProAlertNotifications` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/overview` | JWT + rol admin | global 60/min | `overview` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/promo-rules` | JWT + rol admin | global 60/min | `listPromoRules` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/promo-rules/:key` | JWT + rol admin | global 60/min | `updatePromoRule` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/promotions` | JWT + rol admin | global 60/min | `listPromotions` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions` | JWT + rol admin | global 60/min | `createPromotion` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/promotions/:id` | JWT + rol admin | global 60/min | `deletePromotion` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/promotions/:id` | JWT + rol admin | global 60/min | `getPromotion` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/promotions/:id` | JWT + rol admin | global 60/min | `updatePromotion` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/promotions/:id/documents/:documentId` | JWT + rol admin | global 60/min | `deleteDocument` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/promotions/:id/documents/:documentId` | JWT + rol admin | global 60/min | `updateDocument` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions/:id/documents/upload` | JWT + rol admin | global 60/min | `uploadDocument` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/promotions/:id/preview` | JWT + rol admin | global 60/min | `preview` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/promotions/:id/status` | JWT + rol admin | global 60/min | `updateStatus` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/promotions/:id/units` | JWT + rol admin | global 60/min | `deleteAllUnits` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions/:id/units` | JWT + rol admin | global 60/min | `createUnit` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/promotions/:id/units/:unitId` | JWT + rol admin | global 60/min | `deleteUnit` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/promotions/:id/units/:unitId` | JWT + rol admin | global 60/min | `updateUnit` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions/:id/units/:unitId/duplicate` | JWT + rol admin | global 60/min | `duplicateUnit` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions/:id/units/import-paste` | JWT + rol admin | global 60/min | `importUnitsFromPaste` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/promotions/:id/units/reorder` | JWT + rol admin | global 60/min | `reorderUnits` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/sms-ops` | JWT + rol admin | global 60/min | `smsOps` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/sms-ops/confirm-me` | JWT + rol admin | global 60/min | `confirmMyProSms` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/backoffice/sms-ops/sync` | JWT + rol admin | global 60/min | `syncProSmsAlerts` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/stripe-status` | JWT + rol admin | global 60/min | `getStripeStatus` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/users` | JWT + rol admin | global 60/min | `listUsers` | `backoffice/backoffice.controller.ts` |
| DELETE | `/api/v1/backoffice/users/:id` | JWT + rol admin | global 60/min | `deleteUser` | `backoffice/backoffice.controller.ts` |
| PATCH | `/api/v1/backoffice/users/:id` | JWT + rol admin | global 60/min | `updateUser` | `backoffice/backoffice.controller.ts` |
| GET | `/api/v1/backoffice/waitlist` | JWT + rol admin | global 60/min | `listWaitlist` | `backoffice/backoffice.controller.ts` |
| POST | `/api/v1/billing/checkout` | JWT | 10 / seconds(60) | `createCheckout` | `billing/billing.controller.ts` |
| GET | `/api/v1/billing/checkout-result` | JWT | 30 / seconds(60) | `checkoutResult` | `billing/billing.controller.ts` |
| GET | `/api/v1/billing/checkout-status` | Público | global 60/min | `checkoutStatus` | `billing/billing.controller.ts` |
| POST | `/api/v1/billing/content-supply-start` | JWT | 60 / seconds(60) | `contentSupplyStart` | `billing/billing.controller.ts` |
| POST | `/api/v1/billing/create-portal-session` | JWT | 5 / seconds(60) | `createPortalSession` | `billing/billing.controller.ts` |
| POST | `/api/v1/billing/request-cancellation` | JWT | 3 / minutes(60) | `requestCancellation` | `billing/billing.controller.ts` |
| POST | `/api/v1/billing/webhook` | Firma Stripe | sin límite | `webhook` | `billing/billing.controller.ts` |
| POST | `/api/v1/billing/withdraw-cancellation` | JWT | 5 / seconds(60) | `withdrawCancellation` | `billing/billing.controller.ts` |
| GET | `/api/v1/courses` | Público | global 60/min | `listCourses` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug` | Público | global 60/min | `getCourse` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug/access` | JWT | global 60/min | `getCourseForUser` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug/cover` | Público | global 60/min | `getCourseCover` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug/guide-pdf` | Opcional (JWT) | global 60/min | `getGuidePdf` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug/lessons/:lessonSlug` | JWT | global 60/min | `getLesson` | `courses/courses.controller.ts` |
| POST | `/api/v1/courses/:slug/lessons/:lessonSlug/progress` | JWT | global 60/min | `markLessonCompleted` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/:slug/progress` | JWT | global 60/min | `getCourseProgress` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/access` | JWT | global 60/min | `listCoursesForUser` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/assets/:assetId/url` | JWT | global 60/min | `getCourseAssetUrl` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/file-assets/:fileAssetId/media` | JWT | global 60/min | `getFileAssetMedia` | `courses/courses.controller.ts` |
| GET | `/api/v1/courses/file-assets/:fileAssetId/url` | JWT | global 60/min | `getFileAssetUrl` | `courses/courses.controller.ts` |
| GET | `/api/v1/healthz` | Público | sin límite | `health` | `health/health.controller.ts` |
| POST | `/api/v1/jobs/backfill-news-covers` | Token JOBS_ADMIN_TOKEN | global 60/min | `backfillNewsCovers` | `jobs/jobs.controller.ts` |
| POST | `/api/v1/jobs/generate-daily-news` | Token JOBS_ADMIN_TOKEN | global 60/min | `generateDailyNews` | `jobs/jobs.controller.ts` |
| POST | `/api/v1/metrics/visit` | Público | 5 / 60_000 | `visit` | `metrics/metrics.controller.ts` |
| GET | `/api/v1/news` | Público | global 60/min | `list` | `news/news.controller.ts` |
| GET | `/api/v1/news/:id` | Público | global 60/min | `byId` | `news/news.controller.ts` |
| GET | `/api/v1/promotions` | Opcional (JWT) | global 60/min | `list` | `promotions/promotions.controller.ts` |
| GET | `/api/v1/promotions/:id` | Opcional (JWT) | global 60/min | `byId` | `promotions/promotions.controller.ts` |
| PATCH | `/api/v1/promotions/:id/favorite` | JWT | global 60/min | `updateFavorite` | `promotions/promotions.controller.ts` |
| POST | `/api/v1/promotions/:id/favorite` | JWT | global 60/min | `toggleFavorite` | `promotions/promotions.controller.ts` |
| GET | `/api/v1/promotions/short/:code` | Público | global 60/min | `resolveShortCode` | `promotions/promotions.controller.ts` |
| GET | `/api/v1/promotions/stats` | Público | global 60/min | `stats` | `promotions/promotions.controller.ts` |
| GET | `/api/v1/promotions/user/favorites` | JWT | global 60/min | `favorites` | `promotions/promotions.controller.ts` |
| GET | `/api/v1/users/access` | JWT | global 60/min | `access` | `users/users.controller.ts` |
| DELETE | `/api/v1/users/me` | JWT | 3 / minutes(60) | `deleteMe` | `users/users.controller.ts` |
| GET | `/api/v1/users/me` | JWT | global 60/min | `me` | `users/users.controller.ts` |
| PATCH | `/api/v1/users/me` | JWT | 10 / seconds(60) | `updateMe` | `users/users.controller.ts` |
| GET | `/api/v1/users/me/courses` | JWT | global 60/min | `myCourses` | `users/users.controller.ts` |
| GET | `/api/v1/users/me/export` | JWT | 5 / minutes(60) | `exportMyData` | `users/users.controller.ts` |
| POST | `/api/v1/waitlist` | Opcional (JWT) | 8 / seconds(60) | `join` | `waitlist/waitlist.controller.ts` |

## Frontend: route handlers (`frontend/src/app/**/route.ts`)

Todos se ejecutan en Vercel y reenvían al backend con `buildBackendProxyHeaders` / `applyClientIpHeaders` (IP del visitante firmada con `BACKEND_PROXY_SECRET`).

| Método | Ruta | Fichero |
|---|---|---|
| GET | `/ads.txt` | `app/ads.txt/route.ts` |
| POST | `/api/auth/forgot-password` | `app/api/auth/forgot-password/route.ts` |
| POST | `/api/auth/login` | `app/api/auth/login/route.ts` |
| POST | `/api/auth/logout` | `app/api/auth/logout/route.ts` |
| POST | `/api/auth/refresh` | `app/api/auth/refresh/route.ts` |
| POST | `/api/auth/register` | `app/api/auth/register/route.ts` |
| POST | `/api/auth/resend-verification` | `app/api/auth/resend-verification/route.ts` |
| POST | `/api/auth/reset-password` | `app/api/auth/reset-password/route.ts` |
| POST | `/api/auth/update-unverified-email` | `app/api/auth/update-unverified-email/route.ts` |
| POST | `/api/auth/verify-email` | `app/api/auth/verify-email/route.ts` |
| GET | `/api/backend/[...path]` | `app/api/backend/[...path]/route.ts` |
| POST | `/api/backend/[...path]` | `app/api/backend/[...path]/route.ts` |
| PATCH | `/api/backend/[...path]` | `app/api/backend/[...path]/route.ts` |
| PUT | `/api/backend/[...path]` | `app/api/backend/[...path]/route.ts` |
| DELETE | `/api/backend/[...path]` | `app/api/backend/[...path]/route.ts` |
| GET | `/api/course-covers/[slug]` | `app/api/course-covers/[slug]/route.ts` |
| GET | `/api/course-media/[assetId]` | `app/api/course-media/[assetId]/route.ts` |
| POST | `/api/metrics/visit` | `app/api/metrics/visit/route.ts` |
| GET | `/api/promotion-pdf/[promotionId]/[documentId]` | `app/api/promotion-pdf/[promotionId]/[documentId]/route.ts` |
| GET | `/p/[code]` | `app/p/[code]/route.ts` |

## Frontend: páginas

Las rutas `/admin/**` comprueban el rol en cliente y, sobre todo, en el backend (todas las llamadas `/backoffice/*` exigen rol admin).

- `/`
- `/account`
- `/admin`
- `/admin/access`
- `/admin/alerts`
- `/admin/cancellations`
- `/admin/commerce`
- `/admin/courses`
- `/admin/courses/[courseId]`
- `/admin/files`
- `/admin/message-templates`
- `/admin/news`
- `/admin/promotions`
- `/admin/promotions/[id]`
- `/admin/services`
- `/admin/sms`
- `/admin/users`
- `/admin/waitlist`
- `/alerts`
- `/aviso-legal`
- `/checkout`
- `/condiciones`
- `/contacto`
- `/cookies`
- `/cursos`
- `/cursos/[slug]`
- `/cursos/[slug]/[lessonSlug]`
- `/forgot-password`
- `/gracias`
- `/login`
- `/mi-espacio`
- `/news`
- `/news/[id]`
- `/privacidad`
- `/pro`
- `/promotions`
- `/promotions/[id]`
- `/register`
- `/reset-password`
- `/services`
- `/verify-email`
