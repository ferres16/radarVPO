-- Add indexes for promotions and news to improve listing/query performance
CREATE INDEX IF NOT EXISTS idx_promotions_status_published_at ON promotions (status, published_at);
CREATE INDEX IF NOT EXISTS idx_promotions_status_estimated_publication_date ON promotions (status, estimated_publication_date);

CREATE INDEX IF NOT EXISTS idx_news_items_published_at ON news_items (published_at);
