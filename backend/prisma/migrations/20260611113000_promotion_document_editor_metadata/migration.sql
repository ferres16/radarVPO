-- AlterTable
ALTER TABLE "promotion_documents"
ADD COLUMN "title" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "alt_text" TEXT,
ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "is_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "section" TEXT,
ADD COLUMN "review_status" TEXT NOT NULL DEFAULT 'published';

-- CreateIndex
CREATE INDEX "promotion_documents_promotion_id_sort_order_idx" ON "promotion_documents"("promotion_id", "sort_order");
