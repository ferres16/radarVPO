-- Course CMS rebuild: structured blocks, course assets, SEO and publication metadata.

CREATE TYPE "CoursePricingType" AS ENUM ('free', 'premium');
CREATE TYPE "CourseContentBlockType" AS ENUM (
  'heading',
  'paragraph',
  'image',
  'video',
  'document',
  'list',
  'quote',
  'divider',
  'callout',
  'button',
  'gallery',
  'attachments'
);
CREATE TYPE "CourseAssetKind" AS ENUM (
  'cover',
  'image',
  'video',
  'document',
  'attachment'
);

ALTER TABLE "courses"
  ADD COLUMN "pricing_type" "CoursePricingType" NOT NULL DEFAULT 'free',
  ADD COLUMN "seo_title" TEXT,
  ADD COLUMN "seo_description" TEXT,
  ADD COLUMN "seo_metadata" JSONB,
  ADD COLUMN "published_at" TIMESTAMP(3);

UPDATE "courses"
SET "pricing_type" = CASE
  WHEN "access_type" = 'free' THEN 'free'::"CoursePricingType"
  ELSE 'premium'::"CoursePricingType"
END;

UPDATE "courses"
SET "published_at" = "updated_at"
WHERE "status" = 'published' AND "published_at" IS NULL;

ALTER TABLE "course_lessons"
  ADD COLUMN "summary" TEXT;

CREATE TABLE "course_content_blocks" (
  "id" TEXT NOT NULL,
  "lesson_id" TEXT NOT NULL,
  "type" "CourseContentBlockType" NOT NULL,
  "content" JSONB NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "course_content_blocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "course_assets" (
  "id" TEXT NOT NULL,
  "course_id" TEXT NOT NULL,
  "module_id" TEXT,
  "lesson_id" TEXT,
  "block_id" TEXT,
  "file_asset_id" TEXT,
  "kind" "CourseAssetKind" NOT NULL,
  "original_name" TEXT,
  "mime_type" TEXT NOT NULL,
  "size" INTEGER NOT NULL DEFAULT 0,
  "s3_key" TEXT NOT NULL,
  "url" TEXT,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "alt_text" TEXT,
  "caption" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "course_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "course_content_blocks_lesson_id_order_idx" ON "course_content_blocks"("lesson_id", "order");
CREATE INDEX "course_assets_course_id_idx" ON "course_assets"("course_id");
CREATE INDEX "course_assets_lesson_id_idx" ON "course_assets"("lesson_id");
CREATE INDEX "course_assets_block_id_idx" ON "course_assets"("block_id");
CREATE INDEX "course_assets_file_asset_id_idx" ON "course_assets"("file_asset_id");

ALTER TABLE "course_content_blocks"
  ADD CONSTRAINT "course_content_blocks_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_assets"
  ADD CONSTRAINT "course_assets_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_assets"
  ADD CONSTRAINT "course_assets_module_id_fkey"
  FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_assets"
  ADD CONSTRAINT "course_assets_lesson_id_fkey"
  FOREIGN KEY ("lesson_id") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_assets"
  ADD CONSTRAINT "course_assets_block_id_fkey"
  FOREIGN KEY ("block_id") REFERENCES "course_content_blocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "course_assets"
  ADD CONSTRAINT "course_assets_file_asset_id_fkey"
  FOREIGN KEY ("file_asset_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "course_content_blocks" ("id", "lesson_id", "type", "content", "order", "created_at", "updated_at")
SELECT
  'legacy_' || "id",
  "id",
  'paragraph'::"CourseContentBlockType",
  jsonb_build_object('legacyTipTap', "content_json"),
  0,
  "created_at",
  "updated_at"
FROM "course_lessons"
WHERE "content_json" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "course_content_blocks" WHERE "lesson_id" = "course_lessons"."id"
  );

INSERT INTO "course_assets" (
  "id",
  "course_id",
  "module_id",
  "lesson_id",
  "file_asset_id",
  "kind",
  "original_name",
  "mime_type",
  "size",
  "s3_key",
  "url",
  "is_public",
  "created_at"
)
SELECT
  'legacy_resource_' || r."id",
  r."course_id",
  r."module_id",
  r."lesson_id",
  r."file_asset_id",
  CASE
    WHEN r."kind" = 'image' THEN 'image'::"CourseAssetKind"
    WHEN r."kind" = 'video' THEN 'video'::"CourseAssetKind"
    WHEN r."file_type" = 'application/pdf' THEN 'document'::"CourseAssetKind"
    ELSE 'attachment'::"CourseAssetKind"
  END,
  r."original_name",
  r."file_type",
  COALESCE(f."size", 0),
  r."storage_path",
  NULLIF(r."public_url", ''),
  COALESCE(f."is_public", false),
  r."created_at"
FROM "course_resources" r
LEFT JOIN "file_assets" f ON f."id" = r."file_asset_id";
