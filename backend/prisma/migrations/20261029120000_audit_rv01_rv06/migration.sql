-- RV01: estados editoriales de noticias
CREATE TYPE "NewsEditorialStatus" AS ENUM ('draft', 'published', 'archived');

ALTER TABLE "news_items"
  ADD COLUMN "editorial_status" "NewsEditorialStatus" NOT NULL DEFAULT 'draft',
  ADD COLUMN "grounding_issues" JSONB,
  ADD COLUMN "correction_note" TEXT,
  ADD COLUMN "reviewed_at" TIMESTAMP(3);

-- Piezas ya públicas: conservar visibilidad salvo los dos casos confirmados.
UPDATE "news_items"
SET "editorial_status" = 'published'
WHERE "editorial_status" = 'draft';

UPDATE "news_items"
SET
  "editorial_status" = 'archived',
  "correction_note" = 'Retirada temporal (auditoría 2026-10-29 RV01): la fuente enlazada no respaldaba territorio/cifras del contenido. Pendiente de revisión humana.',
  "reviewed_at" = CURRENT_TIMESTAMP
WHERE "id" IN (
  'cmvlvex9v0029o420xpaeazcw',
  'cmvq7vked002hpe20f53ut4op'
);

CREATE INDEX "news_items_editorial_status_published_at_idx"
  ON "news_items"("editorial_status", "published_at");

-- RV04: municipio canónico + texto original
ALTER TABLE "promotions"
  ADD COLUMN "municipality_raw" TEXT,
  ADD COLUMN "municipality_id" TEXT,
  ADD COLUMN "municipality_needs_review" BOOLEAN NOT NULL DEFAULT false;

UPDATE "promotions"
SET "municipality_raw" = "municipality"
WHERE "municipality" IS NOT NULL AND "municipality_raw" IS NULL;

-- RV06: preferencias territoriales PRO
ALTER TABLE "users"
  ADD COLUMN "alert_municipality_ids" JSONB,
  ADD COLUMN "alert_promotion_types" JSONB;

-- RV02: lista de espera mientras no se vende
CREATE TABLE "waitlist_leads" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "product" TEXT NOT NULL,
  "municipality" TEXT,
  "waitlist_consent_at" TIMESTAMP(3) NOT NULL,
  "marketing_consent_at" TIMESTAMP(3),
  "source_path" TEXT,
  "user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "waitlist_leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "waitlist_leads_email_product_key" ON "waitlist_leads"("email", "product");
CREATE INDEX "waitlist_leads_created_at_idx" ON "waitlist_leads"("created_at");

ALTER TABLE "waitlist_leads"
  ADD CONSTRAINT "waitlist_leads_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
