-- Consentimiento comercial versionado + baja explícita
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in_version" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_out_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "users_email_verified_at_idx" ON "users"("email_verified_at");
CREATE INDEX IF NOT EXISTS "users_marketing_opt_in_at_idx" ON "users"("marketing_opt_in_at");
