-- AlterTable: Add studentEmail column to AdmissionApplication
ALTER TABLE "AdmissionApplication" ADD COLUMN "studentEmail" TEXT;

-- Make studentEmail unique for new records
ALTER TABLE "AdmissionApplication" ADD CONSTRAINT "AdmissionApplication_studentEmail_key" UNIQUE ("studentEmail");
