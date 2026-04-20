/*
  Warnings:

  - Added the required column `dueDate` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "studentId" TEXT;

-- AddForeignKey
ALTER TABLE "FeeStructure" ADD CONSTRAINT "FeeStructure_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
