-- Indexes added after the product/security audit to support public discovery,
-- session validation and monetization lookups.
CREATE INDEX "sessions_revoked_at_expires_at_idx" ON "sessions"("revoked_at", "expires_at");
CREATE INDEX "promotions_province_municipality_published_at_idx" ON "promotions"("province", "municipality", "published_at");
CREATE INDEX "news_items_category_published_at_idx" ON "news_items"("category", "published_at");
CREATE INDEX "courses_status_order_created_at_idx" ON "courses"("status", "order", "created_at");
CREATE INDEX "purchases_course_id_status_idx" ON "purchases"("course_id", "status");
CREATE INDEX "subscriptions_status_current_period_end_idx" ON "subscriptions"("status", "current_period_end");
