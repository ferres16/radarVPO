# Diagnóstico Google Ads / Meta Pixel (2026-10-30)

## Evidencias desde código y producción

| Pieza | Estado |
| --- | --- |
| Meta Pixel `1303653491853194` | Implementado en `ConsentedScripts`, solo con consentimiento **ads** |
| GA4 `G-EQPBRQLPQ6` | Implementado (gtag), consentimiento **analytics** |
| Google Tag Manager (`GTM-…`) | **No** hay contenedor GTM; el snippet del compi era GA4 |
| Google Ads `AW-…` + label de conversión | **No estaba configurado** → causa principal de “Ads no registra lo esperado” |
| Evento `Purchase` / `purchase` | **No existía** hasta este cambio; solo `PageView` / `page_view` |
| `#pagar` | Solo hace scroll al bloque de pago; **no** crea compra ni dispara Purchase |

## Por qué Meta podía mostrar solo `/pro#pagar`

1. El pixel **sí** está en el layout global (todas las rutas), pero **solo tras aceptar publicidad**.
2. Los anuncios suelen aterrizar en `/pro#pagar` → es la URL más vista con consentimiento.
3. Sin evento Purchase, Events Manager prioriza PageView de esa landing.
4. El fragmento `#pagar` **no** genera PageView extra en nuestra SPA (el efecto depende de `pathname`, no del hash).

Eso **no** demuestra que el pixel solo esté en esa página.

## Tabla de eventos (tras el cambio)

| Evento | Cuándo | Meta | GA4 | Google Ads |
| --- | --- | --- | --- | --- |
| PageView / page_view | Consentimiento + carga o cambio de ruta | sí (ads) | sí (analytics) | vía config AW si existe |
| CompleteRegistration / sign_up | Registro en checkout | sí (ads) | sí (analytics) | — |
| InitiateCheckout / begin_checkout | Al crear sesión Stripe | sí (ads) | sí (analytics) | — |
| Purchase / purchase (+ conversion) | `/gracias` con pago **confirmado** en servidor | sí (ads) | sí (analytics) | solo si `NEXT_PUBLIC_GOOGLE_ADS_ID` + `…_PURCHASE_LABEL` |

Compra: importe/moneda/`transaction_id` desde Stripe; dedupe en `sessionStorage` por `transactionId`. No se envía email/nombre/token.

## Capas (no equivalentes)

1. **Código implementado** — hecho en repo.
2. **Evento enviado** — navegador con consentimiento + tags cargados.
3. **Evento recibido** — Events Manager / GA4 DebugView / Ads diagnostics.
4. **Conversión atribuida** — campaña, ventana, modelo; fuera de código.

## Qué debes comprobar tú en paneles

1. Vercel: `NEXT_PUBLIC_GOOGLE_ADS_ID=AW-…` y `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL=…` (desde Ads → Conversiones).
2. Meta Pixel Helper: PageView en varias URLs tras “Aceptar todas”; Purchase solo en `/gracias` tras pago test.
3. GA4 DebugView: `page_view`, `begin_checkout`, `purchase`.
4. Google Ads: etiqueta de conversión disparada (Tag Assistant).
5. Pruebas con **Stripe test**, sin cargos reales ni conversiones ficticias en campañas live.

## Incertidumbres

- Sin acceso a tus paneles Ads/Meta no podemos afirmar “evento recibido” ni “atribuido”.
- Ad blockers / rechazo de cookies → cero eventos (esperado).
