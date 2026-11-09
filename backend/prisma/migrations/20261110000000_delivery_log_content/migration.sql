-- AlterTable
ALTER TABLE "delivery_logs" ADD COLUMN "subject" TEXT;
ALTER TABLE "delivery_logs" ADD COLUMN "content" TEXT;
ALTER TABLE "delivery_logs" ADD COLUMN "context" JSONB;
