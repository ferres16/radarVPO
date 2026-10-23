# Entrega: mejora de principio a fin (rama `cursor/end-to-end-product-cf8a`)

Fecha de trabajo: 23–24 oct 2026 (Europe/Madrid).  
Ámbito: desarrollo en rama; **no** desplegado a producción desde este agente; **no** Stripe live; **no** emails/SMS reales de campaña.

## Implementado

### Comercio y captación
- `salesMode`: `validation` | `live` | `maintenance` (fuente única en `CommerceSettings`).
- Checkout y `createCheckoutSession` exigen `salesMode === 'live'` + interruptor del producto + Stripe listo.
- Por defecto / migración preparada: **validación** (sin cobro). Precio previsto guía: `guideListPriceCents` (1499 = 14,99 €), distinto del precio activo en Stripe/curso.
- Lista de interés: modelo `InterestLead`, `POST /leads/interest`, UI «Avísame cuando esté disponible» en checkout cuando no hay venta.
- Admin Comercio: selector de modo + precio previsto.

### Municipios
- `canonicalizeMunicipality` + alias (p. ej. «a Montgat» → Montgat).
- Scraper y backoffice normalizan al guardar; `municipality_original` para trazabilidad.
- Migración SQL normaliza registros conocidos y vacía calles/números.
- `/promotions`: filtro por municipio canónico, búsqueda, URL `?municipio=&q=`, limpiar filtros.

### Navegación y copy
- Nav principal: Promociones, Avisos previos, Guía VPO, Radar PRO (+ cuenta).
- Noticias / contacto / catálogo en pie.
- Portada: mensaje acordado; CTA principal «Ver promociones gratis».
- `/cursos` entrada breve → ficha canónica `/cursos/guiav1`.
- PRO: sin «curso inicial» inventado; inclusiones solo si hay cursos `accessType=pro` publicados.
- Registro: sin explicación de hash/bcrypt al usuario.
- Recuperar contraseña: cooldown **15 min** (antes 24 h).
- Noticias: prioriza `itemUrl` frente a portada `sourceUrl`.
- Avisos previos: menos cuenta atrás; enlace a origen; lenguaje de estimación.

### Migración
- `backend/prisma/migrations/20261023200000_sales_mode_interest_municipality/migration.sql`
- Incluye notas DOWN (manual). **No aplicada** por este agente en producción.

## Verificado (tests / código)

| Prueba | Resultado |
|--------|-----------|
| `municipality.unit-spec` | OK |
| `password-reset.util.unit-spec` | OK |
| `commerce.service.unit-spec` | OK |
| `frontend public-promotions.test` (Montgat aliases) | OK |

No se verificó en este turno: pago Stripe test E2E, webhooks, correos reales, área privada autenticada en móvil real, LCP de campo.

## Pendiente externo / siguiente

1. Aplicar migración en entorno de staging (no productivo destructivo).
2. Revisar en admin el `salesMode` tras migrar (validación por defecto).
3. Datos fiscales / domicilio pendientes en páginas legales (no inventados).
4. Filtrado PRO por municipio/régimen en servidor (preferencias + envío): preparado el terreno de municipios; **no anunciado** como disponible.
5. Checklist imprimible / recurso captación: solo anunciar cuando exista el PDF/recurso real.
6. Duplicados Calafell / Vilafranca: investigar por identidad de convocatoria (no fusionar solo por PDF/título).
7. Corregir `itemUrl` de noticias históricas que apunten a portadas (datos, no solo UI).
8. Activar `salesMode=live` y cobros solo cuando el negocio esté listo (manual, fuera de este PR).

## Cambios por página (resumen)

| Ruta | Cambio |
|------|--------|
| `/` | Mensaje, CTAs, sin contador de prueba en hero |
| `/promotions` | Filtros + búsqueda + URL |
| `/alerts` | Aviso previo, fuente, estimación sobria |
| `/cursos` | Entrada breve a ficha canónica |
| `/cursos/guiav1` | (existente) ficha + checkout/waitlist |
| `/pro` | Copy sin precio duplicado ni concepto inventado |
| `/register` | Copy de privacidad útil |
| `/forgot-password` | Texto alineado con cooldown 15 min |
| `/news/[id]` | Enlace al artículo (`itemUrl`) |
| `/admin/commerce` | Modo comercial + precio previsto |
