-- Add new access rule value
ALTER TYPE "CourseAccessRuleType" ADD VALUE IF NOT EXISTS 'service';

-- Create enums for services
CREATE TYPE "ServiceStatus" AS ENUM ('active', 'inactive', 'archived');
CREATE TYPE "ServiceType" AS ENUM ('one_time', 'subscription', 'manual');

-- Extend courses with pricing and Stripe payment link
ALTER TABLE "courses"
  ADD COLUMN "price" DECIMAL(12,2),
  ADD COLUMN "currency" VARCHAR(8),
  ADD COLUMN "stripe_payment_link" TEXT;

-- Create services table
CREATE TABLE "services" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DECIMAL(12,2),
  "currency" VARCHAR(8),
  "status" "ServiceStatus" NOT NULL DEFAULT 'active',
  "service_type" "ServiceType" NOT NULL DEFAULT 'manual',
  "stripe_payment_link" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- Create user course access table
CREATE TABLE "user_course_accesses" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "course_id" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activated_by" TEXT,
  "activated_by_admin" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_course_accesses_pkey" PRIMARY KEY ("id")
);

-- Create user service access table
CREATE TABLE "user_service_accesses" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "service_id" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "activated_by" TEXT,
  "activated_by_admin" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_service_accesses_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "services_key_key" ON "services"("key");
CREATE UNIQUE INDEX "user_course_accesses_user_id_course_id_key" ON "user_course_accesses"("user_id", "course_id");
CREATE UNIQUE INDEX "user_service_accesses_user_id_service_id_key" ON "user_service_accesses"("user_id", "service_id");

-- Indexes
CREATE INDEX "services_status_idx" ON "services"("status");
CREATE INDEX "user_course_accesses_user_id_is_active_idx" ON "user_course_accesses"("user_id", "is_active");
CREATE INDEX "user_course_accesses_course_id_idx" ON "user_course_accesses"("course_id");
CREATE INDEX "user_service_accesses_user_id_is_active_idx" ON "user_service_accesses"("user_id", "is_active");
CREATE INDEX "user_service_accesses_service_id_idx" ON "user_service_accesses"("service_id");

-- Foreign keys
ALTER TABLE "user_course_accesses" ADD CONSTRAINT "user_course_accesses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_course_accesses" ADD CONSTRAINT "user_course_accesses_course_id_fkey"
  FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_service_accesses" ADD CONSTRAINT "user_service_accesses_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_service_accesses" ADD CONSTRAINT "user_service_accesses_service_id_fkey"
  FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
