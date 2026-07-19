/*
  Warnings:

  - Added the required column `academicYear` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "academicYear" TEXT NOT NULL;
