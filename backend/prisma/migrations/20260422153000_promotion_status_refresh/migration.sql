ALTER TYPE "PromotionStatus" RENAME TO "PromotionStatus_old";

CREATE TYPE "PromotionStatus" AS ENUM (
  'pending_review',
  'published_unreviewed',
  'published_reviewed',
  'archived'
);

ALTER TABLE "promotions"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PromotionStatus"
  USING (
    CASE
      WHEN "status"::text IN ('detected', 'pending_review') THEN 'pending_review'
      WHEN "status"::text = 'published' THEN 'published_reviewed'
      WHEN "status"::text = 'archived' THEN 'archived'
      ELSE 'pending_review'
    END
  )::"PromotionStatus";

ALTER TABLE "promotions"
  ALTER COLUMN "status" SET DEFAULT 'pending_review';

DROP TYPE "PromotionStatus_old";