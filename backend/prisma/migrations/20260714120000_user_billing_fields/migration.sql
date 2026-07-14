-- AlterTable
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT,
ADD COLUMN "pro_cancellation_requested_at" TIMESTAMP(3);
