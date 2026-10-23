-- P0 Radar VPO: salesMode de validación, leads de interés, municipios canónicos.
-- Reversible: ver comentarios DOWN al final. No destruye compras ni accesos.

-- 1) Comercio: modo validación + precio previsto guía (no altera precios Stripe).
UPDATE "system_settings"
SET
  "value" = COALESCE("value"::jsonb, '{}'::jsonb)
    || jsonb_build_object(
      'salesMode', 'validation',
      'guideListPriceCents', 1499,
      'maintenanceMessage',
        'Todavía no hemos abierto el cobro online. Déjanos tu email y te avisamos cuando esté disponible.'
    ),
  "updated_at" = CURRENT_TIMESTAMP
WHERE "key" = 'commerce.settings';

INSERT INTO "system_settings" ("id", "key", "value", "created_at", "updated_at")
SELECT
  'commerce-settings-validation',
  'commerce.settings',
  '{"salesMode":"validation","proEnabled":false,"coursesEnabled":false,"maintenanceMessage":"Todavía no hemos abierto el cobro online. Déjanos tu email y te avisamos cuando esté disponible.","guideListPriceCents":1499,"proPackGuideSlug":"vpo-inicial","allowPromotionCodes":false,"stripeAutomaticTax":false}'::jsonb,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "system_settings" WHERE "key" = 'commerce.settings'
);

-- 2) Lista de interés
CREATE TABLE IF NOT EXISTS "interest_leads" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "product" TEXT NOT NULL,
  "source" TEXT,
  "municipality" TEXT,
  "tenure_interest" TEXT,
  "search_phase" TEXT,
  "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
  "privacy_version" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "interest_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "interest_leads_email_product_key"
  ON "interest_leads"("email", "product");

CREATE INDEX IF NOT EXISTS "interest_leads_product_created_at_idx"
  ON "interest_leads"("product", "created_at");

-- 3) Municipio original + normalización conocida (conserva original)
ALTER TABLE "promotions"
  ADD COLUMN IF NOT EXISTS "municipality_original" TEXT;

UPDATE "promotions"
SET "municipality_original" = "municipality"
WHERE "municipality_original" IS NULL
  AND "municipality" IS NOT NULL
  AND BTRIM("municipality") <> '';

UPDATE "promotions"
SET "municipality" = 'Montgat'
WHERE lower(BTRIM("municipality")) IN ('a montgat', 'montgat');

UPDATE "promotions"
SET "municipality" = 'Vilafranca del Penedès'
WHERE lower(
  translate(BTRIM("municipality"), 'àáèéìíòóùúÀÁÈÉÌÍÒÓÙÚ', 'aaeeiioouuAAEEIIOOUU')
) IN (
  'a vilafranca',
  'vilafranca del penedes',
  'vilafranca del penedès'
);

UPDATE "promotions"
SET "municipality" = 'El Prat de Llobregat'
WHERE lower(
  translate(BTRIM("municipality"), 'àáèéìíòóùúÀÁÈÉÌÍÒÓÙÚ', 'aaeeiioouuAAEEIIOOUU')
) IN ('el prat de llobregat', 'prat de llobregat');

UPDATE "promotions"
SET "municipality" = 'Sant Cugat del Vallès'
WHERE lower(
  translate(BTRIM("municipality"), 'àáèéìíòóùúÀÁÈÉÌÍÒÓÙÚ', 'aaeeiioouuAAEEIIOOUU')
) IN ('sant cugat', 'sant cugat del valles', 'sant cugat del vallès');

-- Calles / restos que no son municipio: vaciar (original queda en municipality_original)
UPDATE "promotions"
SET "municipality" = NULL
WHERE "municipality" ~ '[0-9]'
   OR "municipality" ~* '\y(carrer|calle|avinguda|av\.|c/)\y';

-- DOWN (manual, no ejecutar en forward):
-- UPDATE system_settings SET value = value - 'salesMode' - 'guideListPriceCents' WHERE key = 'commerce.settings';
-- DROP TABLE IF EXISTS interest_leads;
-- ALTER TABLE promotions DROP COLUMN IF EXISTS municipality_original;
-- (Restaurar municipios desde municipality_original si hiciera falta.)
