-- Email verification, Stripe webhook idempotency, unique payment refs.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" TIMESTAMP(3);

-- Cuentas existentes conservan acceso: se consideran ya verificadas.
UPDATE "users"
SET "email_verified_at" = COALESCE("email_verified_at", "created_at")
WHERE "email_verified_at" IS NULL;

CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_tokens_token_hash_key"
  ON "email_verification_tokens"("token_hash");
CREATE INDEX IF NOT EXISTS "email_verification_tokens_user_id_created_at_idx"
  ON "email_verification_tokens"("user_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "email_verification_tokens"
    ADD CONSTRAINT "email_verification_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "stripe_processed_events" (
    "event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    CONSTRAINT "stripe_processed_events_pkey" PRIMARY KEY ("event_id")
);

CREATE INDEX IF NOT EXISTS "stripe_processed_events_status_created_at_idx"
  ON "stripe_processed_events"("status", "created_at");

-- Deduplicar compras/suscripciones Stripe antes de unique.
DELETE FROM "purchases" a
USING "purchases" b
WHERE a.provider = b.provider
  AND a.provider_ref IS NOT NULL
  AND a.provider_ref = b.provider_ref
  AND a.ctid < b.ctid;

DELETE FROM "subscriptions" a
USING "subscriptions" b
WHERE a.provider = b.provider
  AND a.provider_ref IS NOT NULL
  AND a.provider_ref = b.provider_ref
  AND a.ctid < b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS "purchases_provider_provider_ref_key"
  ON "purchases"("provider", "provider_ref");
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_provider_provider_ref_key"
  ON "subscriptions"("provider", "provider_ref");
