-- CreateEnum
CREATE TYPE "CourseFormat" AS ENUM ('standard', 'guide_pdf');

-- AlterTable courses
ALTER TABLE "courses" ADD COLUMN "format" "CourseFormat" NOT NULL DEFAULT 'standard';
ALTER TABLE "courses" ADD COLUMN "guide_pdf_asset_id" TEXT;

-- AlterTable news_items
ALTER TABLE "news_items" ADD COLUMN "cover_image_url" TEXT;
ALTER TABLE "news_items" ADD COLUMN "cover_image_asset_id" TEXT;

-- CreateIndex
CREATE INDEX "courses_format_idx" ON "courses"("format");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_guide_pdf_asset_id_fkey" FOREIGN KEY ("guide_pdf_asset_id") REFERENCES "file_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
