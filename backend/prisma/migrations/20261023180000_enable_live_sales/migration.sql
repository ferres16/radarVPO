-- Activar venta de PRO y guías para probar checkout y accesos.
-- Stripe Tax (automatic_tax) permanece desactivado.

UPDATE "system_settings"
SET
  "value" = jsonb_set(
    jsonb_set(
      jsonb_set(
        COALESCE("value"::jsonb, '{}'::jsonb),
        '{proEnabled}',
        'true'::jsonb,
        true
      ),
      '{coursesEnabled}',
      'true'::jsonb,
      true
    ),
    '{stripeAutomaticTax}',
    'false'::jsonb,
    true
  ),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'commerce.settings';

INSERT INTO "system_settings" ("id", "key", "value", "created_at", "updated_at")
SELECT
  'commerce-settings-live',
  'commerce.settings',
  '{"proEnabled":true,"coursesEnabled":true,"maintenanceMessage":"El pago online está temporalmente en mantenimiento. Vuelve a intentarlo más adelante.","proPackGuideSlug":"vpo-inicial","allowPromotionCodes":false,"stripeAutomaticTax":false}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "system_settings" WHERE "key" = 'commerce.settings'
);

UPDATE "commerce_promo_rules"
SET
  "enabled" = true,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'pro_pack_3m_grants_guide';
