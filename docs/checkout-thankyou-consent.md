# Compra: /gracias, consentimiento digital y evidencias

Implementado 2026-10-30. **No es certificación jurídica.**

## Flujo

1. Checkout exige casillas separadas: condiciones + inicio inmediato (textos versionados).
2. Al crear Stripe Session se guarda `PurchaseConsent` (snapshot + versión).
3. `success_url` → `/gracias?session_id={CHECKOUT_SESSION_ID}`.
4. `/gracias` llama `GET /billing/checkout-result` (auth + ownership). Estados: confirmed / processing / pending / failed.
5. Webhook concede acceso y envía email de confirmación **una vez** (`confirmationEmailStatus`).
6. Primera apertura de guía/lección → `POST /billing/content-supply-start` (criterio técnico documentado).

## Admin

En Compras y Activaciones: compras, consentimientos, email conf., aperturas, suscripciones.

## Pendiente externo / jurídico

- Migración Prisma en el entorno de BD (`purchase_consents`, `content_supply_events`).
- Plantillas Brevo `purchase.*` pueden enriquecerse con `consent_summary` / `contract_version` / `purchase_ref`.
- Validación legal de textos TRLGDCU / desistimiento PRO.
- Google Ads `AW-…` + label (ver `docs/ads-meta-diagnosis.md`).
- Pruebas Stripe **test** end-to-end en entorno no productivo.
