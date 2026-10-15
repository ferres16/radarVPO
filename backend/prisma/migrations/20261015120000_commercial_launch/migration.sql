-- Mi espacio: seguimiento personal de las promociones guardadas
CREATE TYPE "FavoriteStage" AS ENUM ('interested', 'preparing', 'applied', 'discarded');

ALTER TABLE "promotion_favorites"
  ADD COLUMN "stage" "FavoriteStage" NOT NULL DEFAULT 'interested',
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "checklist_done" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Precio unico del curso avanzado: se retira la "oferta" 149 -> 89 (sin precio de referencia
-- verificable). El precio vigente pasa a ser 89 EUR. Idempotente: solo actua si sigue en 149.
UPDATE "courses"
SET "price" = 89,
    "sale_price" = NULL,
    "seo_metadata" = CASE
      WHEN "seo_metadata" IS NULL THEN NULL
      ELSE ("seo_metadata"::jsonb - 'salePrice')
    END
WHERE "slug" = 'cursoavanzado'
  AND "price" = 149;

-- Leccion de muestra gratuita del curso inicial (se puede quitar borrando la clave
-- previewLessonSlug de seo_metadata). Solo actua si no hay ya una configurada.
UPDATE "courses"
SET "seo_metadata" = COALESCE("seo_metadata"::jsonb, '{}'::jsonb) || '{"previewLessonSlug":"vpo-1"}'::jsonb
WHERE "slug" = 'vpo-inicial'
  AND ("seo_metadata" IS NULL OR "seo_metadata"::jsonb->>'previewLessonSlug' IS NULL);
