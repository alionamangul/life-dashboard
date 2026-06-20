-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN "category" TEXT;

-- CreateIndex
CREATE INDEX "Medicine_category_idx" ON "Medicine"("category");
