# Contraste auditoría RV01–RV06 · 2026-10-29

Diagnóstico contrastado con el código del repositorio e implementación aplicada en esta entrega.

## Clasificación

| ID | Estado en código | Causa raíz confirmada | Cambio aplicado |
| --- | --- | --- | --- |
| **RV01** | Confirmado | Automatización publicaba sin revisión; AI/fallback podían afirmar Catalunya/cifras no presentes en la fuente; `sourceUrl` del feed (portada) frente al artículo | Estados `draft/published/archived`; grounding obligatorio; borradores por defecto; archivo de los dos IDs confirmados; admin con estado editorial y nota de corrección |
| **RV02** | Confirmado | Con ventas off, el checkout solo mostraba mensaje y botón de pago deshabilitado (callejón sin salida) | `WaitlistLead` + `POST /waitlist`; UI de lista de espera con consentimientos separados cuando el producto no es vendible |
| **RV03** | Confirmado (copy genérico / ambiguo hacia compra) | El registro no adaptaba el título al origen `next` de guardar promoción | `resolveRegisterIntent`: textos “guardar esta promoción” vs “comprar la guía”; CTA Guardar apunta a `/register?next=…` |
| **RV04** | Confirmado | `inferMunicipality` capturaba texto sucio (`a Montgat`, calles); filtro exacto rompía el catálogo | Catálogo canónico + `municipalityRaw`/`municipalityId`; filtro y contador por id/label canónico |
| **RV05** | Mejora comercial | Muestra = índice/hooks, sin páginas desarrolladas | Tres páginas de muestra (presupuesto, proceso, checklist) con reglas generales vs convocatoria, fecha y fuentes |
| **RV06** | Confirmado | Notificaciones PRO a todos los usuarios PRO sin filtro territorial | Preferencias `alertMunicipalityIds` / `alertPromotionTypes`; filtro en envío; UI en Mi cuenta; copy PRO actualizado |

## Archivos principales

- Backend: `news-automation.service.ts`, `source-grounding.ts`, `news.service.ts`, `registre-scraper.service.ts`, `catalunya-municipalities.ts`, `waitlist/*`, `pro-alert-preferences.ts`, `users.service.ts`, `notifications.service.ts`, migración `20261029120000_audit_rv01_rv06`
- Frontend: `waitlist-form.tsx`, `checkout-panel.tsx`, `register/page.tsx`, `register-intent.ts`, `municipalities.ts`, `promotions-explorer.tsx`, `guide-sample.tsx`, `guide-sample-pages.ts`, `pro-alert-preferences.tsx`, `admin/news/page.tsx`, `pro.ts`

## Pruebas

- Unitarias nuevas: grounding, municipios, preferencias PRO, register intent, municipalities front
- Ejecutar: `npm --workspace backend run test:unit` y `npm --workspace frontend run test`

## Riesgos restantes / despliegue

1. Aplicar migración Prisma en cada entorno antes de desplegar API.
2. Revisar en admin el resto del catálogo de noticias en `draft` tras la primera generación post-cambio; publicar solo con fuente validada.
3. Backfill opcional de `municipalityId` en promociones históricas (rescrape o script); hasta entonces el front normaliza aliases conocidos.
4. Lista de espera: medir altas con analytics (`waitlist_joined`) solo con consentimiento de analytics.
5. RV07+ no abordados en esta entrega (identidad fiscal, MFA admin, etc.).
6. No se ha cobrado ni enviado correo masivo en producción como parte de las pruebas.
