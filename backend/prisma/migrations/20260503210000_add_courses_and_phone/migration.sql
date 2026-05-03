ALTER TABLE "users" ADD COLUMN "phone" TEXT NOT NULL DEFAULT '';

ALTER TABLE "educational_topics" ADD COLUMN "slug" TEXT;
UPDATE "educational_topics" SET "slug" = CONCAT('topic-', "id") WHERE "slug" IS NULL;
ALTER TABLE "educational_topics" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "educational_topics_slug_key" ON "educational_topics"("slug");

ALTER TABLE "educational_posts" ADD COLUMN "slug" TEXT;
ALTER TABLE "educational_posts" ADD COLUMN "summary" TEXT;
ALTER TABLE "educational_posts" ADD COLUMN "position" INTEGER NOT NULL DEFAULT 0;
UPDATE "educational_posts" SET "slug" = CONCAT('post-', "id") WHERE "slug" IS NULL;
ALTER TABLE "educational_posts" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "educational_posts_slug_key" ON "educational_posts"("slug");

CREATE TABLE "educational_assets" (
  "id" TEXT NOT NULL,
  "post_id" TEXT NOT NULL,
  "kind" TEXT NOT NULL,
  "file_type" TEXT NOT NULL,
  "original_name" TEXT,
  "storage_path" TEXT NOT NULL,
  "public_url" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "educational_assets_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "educational_assets_post_id_idx" ON "educational_assets"("post_id");

ALTER TABLE "educational_assets"
  ADD CONSTRAINT "educational_assets_post_id_fkey"
  FOREIGN KEY ("post_id")
  REFERENCES "educational_posts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
