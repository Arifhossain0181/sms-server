/*
  Warnings:

  - A unique constraint covering the columns `[classId,feeType,studentId]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FeeStructure_classId_feeType_key";

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_classId_feeType_studentId_key" ON "FeeStructure"("classId", "feeType", "studentId");
