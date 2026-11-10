-- Auditoría de lanzamiento: índices en claves foráneas y columnas consultadas.
-- Solo añade índices (no modifica datos). IF NOT EXISTS: re-ejecutable.
-- Reversión: prisma/migrations/20261110120000_audit_indexes/down.sql
-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "content_supply_events_course_id_idx" ON "content_supply_events"("course_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "course_progress_course_id_idx" ON "course_progress"("course_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "course_progress_last_lesson_id_idx" ON "course_progress"("last_lesson_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "delivery_failures_created_at_idx" ON "delivery_failures"("created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "delivery_failures_source_ref_idx" ON "delivery_failures"("source_ref");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "delivery_logs_target_idx" ON "delivery_logs"("target");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_runs_started_at_idx" ON "job_runs"("started_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "job_runs_status_started_at_idx" ON "job_runs"("status", "started_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lesson_progress_lesson_id_idx" ON "lesson_progress"("lesson_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "lesson_progress_module_id_idx" ON "lesson_progress"("module_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "promotion_favorites_promotion_id_idx" ON "promotion_favorites"("promotion_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "published_posts_source_id_source_kind_audience_channel_stat_idx" ON "published_posts"("source_id", "source_kind", "audience", "channel", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "purchase_consents_course_id_idx" ON "purchase_consents"("course_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "purchases_status_purchased_at_idx" ON "purchases"("status", "purchased_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reminders_user_id_idx" ON "reminders"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "reminders_sent_at_remind_at_idx" ON "reminders"("sent_at", "remind_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_alerts_user_id_idx" ON "user_alerts"("user_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "waitlist_leads_user_id_idx" ON "waitlist_leads"("user_id");

