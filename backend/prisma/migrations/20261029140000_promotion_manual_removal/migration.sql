-- Tombstone de eliminaciones manuales: el scraper no debe resucitar estas piezas.
ALTER TABLE "promotions"
  ADD COLUMN "manually_removed_at" TIMESTAMP(3);

CREATE INDEX "promotions_manually_removed_at_idx"
  ON "promotions"("manually_removed_at");

CREATE INDEX "promotions_source_url_idx"
  ON "promotions"("source_url");
