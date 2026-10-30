-- Evidencia contractual de checkout + aperturas efectivas de contenido digital.

CREATE TABLE "purchase_consents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purchase_id" TEXT,
    "stripe_session_id" TEXT NOT NULL,
    "product_key" TEXT NOT NULL,
    "course_id" TEXT,
    "terms_version" TEXT NOT NULL,
    "terms_text_snapshot" TEXT NOT NULL,
    "terms_accepted_at" TIMESTAMP(3) NOT NULL,
    "immediate_consent_version" TEXT,
    "immediate_text_snapshot" TEXT,
    "immediate_accepted_at" TIMESTAMP(3),
    "confirmation_email_status" TEXT NOT NULL DEFAULT 'pending',
    "confirmation_email_sent_at" TIMESTAMP(3),
    "confirmation_email_error" TEXT,
    "first_content_opened_at" TIMESTAMP(3),
    "last_content_opened_at" TIMESTAMP(3),
    "access_granted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_consents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "purchase_consents_purchase_id_key" ON "purchase_consents"("purchase_id");
CREATE UNIQUE INDEX "purchase_consents_stripe_session_id_key" ON "purchase_consents"("stripe_session_id");
CREATE INDEX "purchase_consents_user_id_created_at_idx" ON "purchase_consents"("user_id", "created_at");
CREATE INDEX "purchase_consents_product_key_created_at_idx" ON "purchase_consents"("product_key", "created_at");
CREATE INDEX "purchase_consents_confirmation_email_status_idx" ON "purchase_consents"("confirmation_email_status");

ALTER TABLE "purchase_consents" ADD CONSTRAINT "purchase_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "purchase_consents" ADD CONSTRAINT "purchase_consents_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "content_supply_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT,
    "consent_id" TEXT,
    "product_key" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'open',
    "path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_supply_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_supply_events_user_id_course_id_created_at_idx" ON "content_supply_events"("user_id", "course_id", "created_at");
CREATE INDEX "content_supply_events_consent_id_created_at_idx" ON "content_supply_events"("consent_id", "created_at");

ALTER TABLE "content_supply_events" ADD CONSTRAINT "content_supply_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
