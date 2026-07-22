-- CreateEnum
CREATE TYPE "MarkStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Mark" ADD COLUMN     "rejectReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "status" "MarkStatus" NOT NULL DEFAULT 'SUBMITTED';

-- CreateIndex
CREATE INDEX "Mark_examId_status_idx" ON "Mark"("examId", "status");
