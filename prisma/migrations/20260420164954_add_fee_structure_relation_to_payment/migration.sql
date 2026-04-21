-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "feeStructureId" TEXT;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
