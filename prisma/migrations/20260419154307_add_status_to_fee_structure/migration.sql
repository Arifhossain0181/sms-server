/*
  Warnings:

  - Added the required column `status` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "status" TEXT NOT NULL;
