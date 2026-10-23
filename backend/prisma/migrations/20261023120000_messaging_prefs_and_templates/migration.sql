-- Preferencias de mensajería y sincronización de plantillas.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "sms_alerts_enabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "message_templates" ADD COLUMN IF NOT EXISTS "is_customized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "message_templates" ADD COLUMN IF NOT EXISTS "seed_revision" INTEGER NOT NULL DEFAULT 1;

-- Plantillas existentes se consideran no personalizadas para poder refrescar copy v2.
UPDATE "message_templates"
SET "is_customized" = false
WHERE "is_customized" IS DISTINCT FROM true;
