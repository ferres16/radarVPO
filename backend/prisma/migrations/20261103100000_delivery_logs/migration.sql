-- CreateTable
CREATE TABLE "delivery_logs" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "source_ref" TEXT,
    "error_code" TEXT,
    "error_detail" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_logs_channel_created_at_idx" ON "delivery_logs"("channel", "created_at");

-- CreateIndex
CREATE INDEX "delivery_logs_status_created_at_idx" ON "delivery_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "delivery_logs_source_ref_idx" ON "delivery_logs"("source_ref");
