-- Rework promotions pipeline to manual-first workflow without AI PDF parsing.

CREATE TYPE "PromotionStatus_new" AS ENUM ('detected', 'pending_review', 'published', 'archived');

ALTER TABLE "promotions"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PromotionStatus_new"
  USING (
    CASE
      WHEN "status"::text = 'upcoming' THEN 'pending_review'::"PromotionStatus_new"
      WHEN "status"::text = 'open' THEN 'published'::"PromotionStatus_new"
      WHEN "status"::text = 'closed' THEN 'archived'::"PromotionStatus_new"
      ELSE 'pending_review'::"PromotionStatus_new"
    END
  ),
  ALTER COLUMN "status" SET DEFAULT 'pending_review';

DROP TYPE "PromotionStatus";
ALTER TYPE "PromotionStatus_new" RENAME TO "PromotionStatus";

ALTER TABLE "promotions"
  DROP COLUMN IF EXISTS "ai_status",
  DROP COLUMN IF EXISTS "publish_status",
  DROP COLUMN IF EXISTS "future_launch",
  ADD COLUMN IF NOT EXISTS "alert_detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "status_message" TEXT NOT NULL DEFAULT 'Estamos analizando esta promocion y actualizando la informacion',
  ADD COLUMN IF NOT EXISTS "promoter" TEXT,
  ADD COLUMN IF NOT EXISTS "total_homes" INTEGER,
  ADD COLUMN IF NOT EXISTS "general_info" JSONB,
  ADD COLUMN IF NOT EXISTS "important_dates" JSONB,
  ADD COLUMN IF NOT EXISTS "requirements" JSONB,
  ADD COLUMN IF NOT EXISTS "economic_info" JSONB,
  ADD COLUMN IF NOT EXISTS "fees_and_reservations" JSONB,
  ADD COLUMN IF NOT EXISTS "contact_info" JSONB,
  ADD COLUMN IF NOT EXISTS "public_description" TEXT;

CREATE TYPE "PromotionDocumentKind" AS ENUM ('pdf_original', 'screenshot', 'image', 'support_document');

ALTER TABLE "promotion_documents"
  DROP COLUMN IF EXISTS "document_url",
  DROP COLUMN IF EXISTS "extracted_text",
  DROP COLUMN IF EXISTS "processed_at",
  ADD COLUMN IF NOT EXISTS "document_kind" "PromotionDocumentKind" NOT NULL DEFAULT 'support_document',
  ADD COLUMN IF NOT EXISTS "original_name" TEXT,
  ADD COLUMN IF NOT EXISTS "storage_path" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "public_url" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "uploaded_by" TEXT;

CREATE INDEX IF NOT EXISTS "promotion_documents_promotion_id_document_kind_idx"
  ON "promotion_documents"("promotion_id", "document_kind");

DROP TABLE IF EXISTS "promotion_ai_analysis";

CREATE TABLE IF NOT EXISTS "promotion_units" (
  "id" TEXT NOT NULL,
  "promotion_id" TEXT NOT NULL,
  "row_order" INTEGER NOT NULL DEFAULT 0,
  "unit_label" TEXT,
  "building" TEXT,
  "stair" TEXT,
  "floor" TEXT,
  "door" TEXT,
  "bedrooms" INTEGER,
  "bathrooms" INTEGER,
  "useful_area_m2" DECIMAL(8,2),
  "built_area_m2" DECIMAL(8,2),
  "price_sale" DECIMAL(12,2),
  "monthly_rent" DECIMAL(12,2),
  "reservation" DECIMAL(12,2),
  "notes" TEXT,
  "extra_data" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "promotion_units_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "promotion_units_promotion_id_row_order_idx"
  ON "promotion_units"("promotion_id", "row_order");

ALTER TABLE "promotion_units"
  ADD CONSTRAINT "promotion_units_promotion_id_fkey"
  FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "news_items"
  ADD COLUMN IF NOT EXISTS "body" TEXT,
  ADD COLUMN IF NOT EXISTS "practical_impact" TEXT,
  ADD COLUMN IF NOT EXISTS "topic" TEXT;
