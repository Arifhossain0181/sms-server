/*
  Warnings:

  - Added the required column `guardianRelation` to the `AdmissionApplication` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GuardianRelation" AS ENUM ('FATHER', 'MOTHER', 'OTHER');

-- AlterTable
ALTER TABLE "AdmissionApplication" ADD COLUMN     "guardianRelation" "GuardianRelation" NOT NULL;
