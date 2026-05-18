/*
  Warnings:

  - You are about to drop the `educational_assets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `educational_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `educational_topics` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "CourseAccessType" AS ENUM ('free', 'paid', 'pro', 'seguimiento');

-- CreateEnum
CREATE TYPE "CourseModuleVisibility" AS ENUM ('visible', 'hidden');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('text', 'video', 'downloadable', 'faq');

-- CreateEnum
CREATE TYPE "CourseResourceKind" AS ENUM ('image', 'video', 'file');

-- CreateEnum
CREATE TYPE "CourseAccessRuleType" AS ENUM ('plan', 'entitlement', 'purchase', 'subscription');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('not_started', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('pending', 'paid', 'refunded', 'canceled');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'expired');

-- DropForeignKey
ALTER TABLE "educational_assets" DROP CONSTRAINT "educational_assets_post_id_fkey";

-- DropForeignKey
ALTER TABLE "educational_posts" DROP CONSTRAINT "educational_posts_topic_id_fkey";

-- AlterTable
ALTER TABLE "news_feed_items" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "promotion_documents" ALTER COLUMN "document_kind" DROP DEFAULT,
ALTER COLUMN "storage_path" DROP DEFAULT,
ALTER COLUMN "public_url" DROP DEFAULT;

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone" DROP DEFAULT;

-- DropTable
DROP TABLE "educational_assets";

-- DropTable
DROP TABLE "educational_posts";

-- DropTable
DROP TABLE "educational_topics";

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "short_description" TEXT,
    "long_description" TEXT,
    "cover_image" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'draft',
    "access_type" "CourseAccessType" NOT NULL DEFAULT 'free',
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "visibility" "CourseModuleVisibility" NOT NULL DEFAULT 'visible',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_lessons" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content_json" JSONB,
    "order" INTEGER NOT NULL DEFAULT 0,
    "duration_minutes" INTEGER,
    "status" "LessonStatus" NOT NULL DEFAULT 'draft',
    "type" "LessonType" NOT NULL DEFAULT 'text',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_resources" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "module_id" TEXT,
    "lesson_id" TEXT,
    "kind" "CourseResourceKind" NOT NULL,
    "file_type" TEXT NOT NULL,
    "original_name" TEXT,
    "storage_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_access_rules" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "rule_type" "CourseAccessRuleType" NOT NULL,
    "config_json" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_access_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_entitlements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "source_id" TEXT,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_entitlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT,
    "product_key" TEXT NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'pending',
    "amount" DECIMAL(12,2),
    "currency" VARCHAR(8),
    "purchased_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_ref" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'trialing',
    "plan_key" TEXT NOT NULL,
    "current_period_start" TIMESTAMP(3),
    "current_period_end" TIMESTAMP(3),
    "cancel_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "completed_lessons" INTEGER NOT NULL DEFAULT 0,
    "total_lessons" INTEGER NOT NULL DEFAULT 0,
    "last_lesson_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "lesson_id" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'not_started',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_status_access_type_idx" ON "courses"("status", "access_type");

-- CreateIndex
CREATE INDEX "course_modules_course_id_order_idx" ON "course_modules"("course_id", "order");

-- CreateIndex
CREATE INDEX "course_lessons_module_id_order_idx" ON "course_lessons"("module_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "course_lessons_course_id_slug_key" ON "course_lessons"("course_id", "slug");

-- CreateIndex
CREATE INDEX "course_resources_course_id_idx" ON "course_resources"("course_id");

-- CreateIndex
CREATE INDEX "course_resources_lesson_id_idx" ON "course_resources"("lesson_id");

-- CreateIndex
CREATE INDEX "course_access_rules_course_id_rule_type_idx" ON "course_access_rules"("course_id", "rule_type");

-- CreateIndex
CREATE INDEX "user_entitlements_user_id_key_idx" ON "user_entitlements"("user_id", "key");

-- CreateIndex
CREATE INDEX "purchases_user_id_status_idx" ON "purchases"("user_id", "status");

-- CreateIndex
CREATE INDEX "subscriptions_user_id_status_idx" ON "subscriptions"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "course_progress_user_id_course_id_key" ON "course_progress"("user_id", "course_id");

-- CreateIndex
CREATE INDEX "lesson_progress_course_id_user_id_idx" ON "lesson_progress"("course_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_user_id_lesson_id_key" ON "lesson_progress"("user_id", "lesson_id");

-- AddForeignKey
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_resources" ADD CONSTRAINT "course_resources_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_access_rules" ADD CONSTRAINT "course_access_rules_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_entitlements" ADD CONSTRAINT "user_entitlements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_last_lesson_id_fkey" FOREIGN KEY ("last_lesson_id") REFERENCES "course_lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "course_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
