# Integraciones externas

[← Índice](./README.md)

Nombres de variables en [reference/env-vars.md](./reference/env-vars.md). Ningún valor real se documenta ni se versiona.

## Stripe (pagos)

| Aspecto | Implementación | Fichero |
|---|---|---|
| Creación de pago | Checkout Sessions con `price_data` calculado en el servidor (curso, PRO mensual, pack 3 meses). El cliente no envía importes | `billing/billing.service.ts` |
| Webhook | `POST /api/v1/billing/webhook`, cuerpo crudo (`rawBody`) + `stripe.webhooks.constructEvent` con `STRIPE_WEBHOOK_SECRET`. Sin rate limit (Stripe reintenta) | `billing.controller.ts`, `billing.service.ts` |
| Eventos tratados | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created/updated/deleted`, `charge.refunded` | `billing.service.ts` |
| Idempotencia | `stripe_processed_events` (PK = id de evento, estado `processing`/`processed`). Claims `processing` de más de 10 min se liberan para que el reintento de Stripe se procese | `WEBHOOK_CLAIM_STALE_MS` |
| Orden de eventos | Los eventos de suscripción se resuelven con `subscriptions.retrieve` (estado actual), no con el snapshot del evento | `latestSubscriptionState` |
| Efectos únicos | Email de confirmación una vez por sesión (`purchase_consents.confirmation_email_status`); SMS de bienvenida PRO con `sourceRef` único | `sendPurchaseConfirmationOnce`, `enableProSmsAlerts` |
| Test vs producción | El modo se deduce del prefijo de `STRIPE_SECRET_KEY` (`stripeKeyMode`) y se muestra en `/admin` sin revelar la clave. El webhook de test y el de live tienen secretos distintos: un evento de test no valida con el secreto live | `stripe-fulfillment.ts` |
| Portal de cliente | `POST /billing/create-portal-session` (JWT, 5/min) | `billing.service.ts` |
| Documentos de pago | Stripe emite recibos. **No hay generación de facturas** propia (ver [legal-privacy.md](./legal-privacy.md)) | — |

**Pendiente / limitaciones**

- Reembolsos de PRO y disputas (`charge.dispute.*`) no se automatizan. Procedimiento en [operations.md](./operations.md#reembolsos-y-disputas).
- Al añadir un evento nuevo hay que suscribirlo también en el endpoint del Dashboard de Stripe.

## Brevo (email transaccional y SMS)

| Aspecto | Implementación |
|---|---|
| Envío | `https://api.brevo.com` con `BREVO_API_KEY`; remitentes `BREVO_EMAIL_SENDER`, `BREVO_SMS_SENDER`; avisos a admin `BREVO_ADMIN_EMAIL` |
| Interruptor | `BREVO_PRO_ALERTS_ENABLED` activa los avisos PRO masivos |
| Plantillas | Tabla `message_templates` editable en `/admin/message-templates`; fallback en código. Las variables se **escapan en HTML** en el cuerpo del email; asunto y SMS son texto plano |
| SMS | Transliteración GSM-7, máximo 2 segmentos, se bloquea el envío si el contenido quedaría roto; enlaces cortos `/p/:code` |
| Registro | `delivery_logs` (canal, destino, asunto, contenido, motivo, estado) y `delivery_failures` |
| Duplicados | `sourceRef` por evento/usuario evita reenviar el mismo aviso |
| Reintentos | No hay reintento automático de envíos fallidos; quedan en `delivery_failures` para revisión |

## Almacenamiento S3-compatible

| Aspecto | Implementación |
|---|---|
| Configuración | `S3_*` o `AWS_*` (endpoint, región, bucket, credenciales, `S3_PUBLIC_BASE_URL`, `S3_FORCE_PATH_STYLE`) |
| Públicos | Portadas de curso, imágenes de lección, documentos oficiales de promociones (`ACL public-read` si el bucket lo admite) |
| Privados | Guía PDF, documentos de lección: solo vía backend tras comprobar acceso, o URL firmada (`S3_SIGNED_URL_TTL_SECONDS`, 900 s por defecto) |
| Claves | `carpeta/<timestamp>-<24 hex aleatorios>-<nombre saneado>` |
| Validación | MIME en lista blanca + tamaño máximo por tipo; solo administradores suben ficheros |
| Borrado | `file_assets.status` + reintento de borrado en `/admin/files` |

**Comprobar en el proveedor** (no verificable desde el repositorio): que el bucket **no** tenga lectura pública a nivel de bucket y que exista versionado o copia de seguridad.

## WhatsApp

Solo enlaces `wa.me` (sin API ni datos enviados por el backend): `frontend/src/lib/whatsapp.ts`, configurable con `NEXT_PUBLIC_PRO_WHATSAPP_NUMBER` / `NEXT_PUBLIC_PRO_WHATSAPP_URL`. El número por defecto está en el código.

## IA (noticias y análisis de PDFs)

`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_IMAGE_MODEL` (`backend/src/ai/`). Se usa en jobs para resumir fuentes oficiales y generar portadas. No recibe datos personales de usuarios.

## Analítica y publicidad

| Herramienta | Carga | Consentimiento |
|---|---|---|
| Vercel Analytics | `ConsentedScripts` | Categoría analítica |
| Google Analytics 4 / Google Ads (`NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`) | `ConsentedScripts` | Analítica / anuncios |
| Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`) | `ConsentedScripts`; eventos de conversión en `lib/conversion-pixels.ts` comprueban el consentimiento | Anuncios |
| Google AdSense (`NEXT_PUBLIC_ADSENSE_*`) | Antes del consentimiento solo la meta `google-adsense-account`; `adsbygoogle.js` se inyecta tras aceptar anuncios | Anuncios |

La CSP (`frontend/next.config.ts`, `lib/ads-csp.ts`, `lib/marketing-csp.ts`) permite estos orígenes. Los errores `connect-src` reportados (`mpc-prod-*.us-central1.run.app`, `kw-*.ecs.us-west-1.on.aws`) eran del gateway de Meta Pixel y ya están cubiertos en producción (comprobado con `curl -I https://www.radarvpo.com`); solo ocurren tras aceptar anuncios.
