-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "receipt_number" INTEGER;
ALTER TABLE "Payment" ADD COLUMN "receipt_token_hash" TEXT;
ALTER TABLE "Payment" ADD COLUMN "receipt_token_expires_at" DATETIME;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_receipt_number_key" ON "Payment"("receipt_number");
