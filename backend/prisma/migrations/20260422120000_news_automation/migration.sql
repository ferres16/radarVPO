ALTER TABLE "news_items" ADD COLUMN "slug" TEXT;
ALTER TABLE "news_items" ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general';
ALTER TABLE "news_items" ADD COLUMN "municipality" TEXT;

CREATE UNIQUE INDEX "news_items_slug_key" ON "news_items"("slug");

CREATE TABLE "news_feed_items" (
    "id" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "feed_url" TEXT NOT NULL,
    "source_name" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "snippet" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "category" TEXT,
    "relevance_score" INTEGER NOT NULL DEFAULT 0,
    "matched_keywords" JSONB,
    "selected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_feed_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "news_feed_items_content_hash_key" ON "news_feed_items"("content_hash");
CREATE INDEX "news_feed_items_published_at_relevance_score_idx" ON "news_feed_items"("published_at", "relevance_score");
CREATE INDEX "news_feed_items_category_selected_at_idx" ON "news_feed_items"("category", "selected_at");

CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
