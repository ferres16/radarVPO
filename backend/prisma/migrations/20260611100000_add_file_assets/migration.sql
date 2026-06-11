-- CreateEnum
CREATE TYPE "FileEntityType" AS ENUM ('promotion', 'alert', 'course', 'module', 'lesson', 'news', 'service');

-- CreateEnum
CREATE TYPE "FileAssetStatus" AS ENUM ('active', 'deleted', 'delete_failed');

-- AlterTable
ALTER TABLE "promotion_documents" ADD COLUMN "file_asset_id" TEXT;

-- AlterTable
ALTER TABLE "course_resources" ADD COLUMN "file_asset_id" TEXT;

-- CreateTable
CREATE TABLE "file_assets" (
    "id" TEXT NOT NULL,
    "entity_type" "FileEntityType" NOT NULL,
    "entity_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3_key" TEXT NOT NULL,
    "s3_bucket" TEXT NOT NULL,
    "url" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "uploaded_by_user_id" TEXT,
    "status" "FileAssetStatus" NOT NULL DEFAULT 'active',
    "delete_error" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "file_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "file_assets_s3_bucket_s3_key_key" ON "file_assets"("s3_bucket", "s3_key");

-- CreateIndex
CREATE INDEX "file_assets_entity_type_entity_id_idx" ON "file_assets"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "file_assets_uploaded_by_user_id_idx" ON "file_assets"("uploaded_by_user_id");

-- CreateIndex
CREATE INDEX "file_assets_status_idx" ON "file_assets"("status");

-- CreateIndex
CREATE INDEX "promotion_documents_file_asset_id_idx" ON "promotion_documents"("file_asset_id");

-- CreateIndex
CREATE INDEX "course_resources_file_asset_id_idx" ON "course_resources"("file_asset_id");

-- AddForeignKey
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_uploaded_by_user_id_fkey" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_documents" ADD CONSTRAINT "promotion_documents_file_asset_id_fkey" FOREIGN KEY ("file_asset_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_file_asset_id_fkey" FOREIGN KEY ("file_asset_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
