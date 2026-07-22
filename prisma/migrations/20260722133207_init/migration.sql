/*
  Warnings:

  - You are about to drop the column `gpa` on the `GradingRule` table. All the data in the column will be lost.
  - You are about to drop the column `maxPercent` on the `GradingRule` table. All the data in the column will be lost.
  - You are about to drop the column `minPercent` on the `GradingRule` table. All the data in the column will be lost.
  - Added the required column `classId` to the `GradingRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gpaPoint` to the `GradingRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxMark` to the `GradingRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minMark` to the `GradingRule` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GradingRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GradingRule" DROP COLUMN "gpa",
DROP COLUMN "maxPercent",
DROP COLUMN "minPercent",
ADD COLUMN     "academicYear" TEXT,
ADD COLUMN     "classId" TEXT NOT NULL,
ADD COLUMN     "gpaPoint" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isPassing" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxMark" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minMark" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "GradingRule_classId_academicYear_idx" ON "GradingRule"("classId", "academicYear");

-- AddForeignKey
ALTER TABLE "GradingRule" ADD CONSTRAINT "GradingRule_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
