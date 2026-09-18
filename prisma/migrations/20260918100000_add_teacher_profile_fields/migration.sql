-- AlterTable
ALTER TABLE "Teacher"
  ADD COLUMN "presentAddress" TEXT,
  ADD COLUMN "permanentAddress" TEXT,
  ADD COLUMN "nationalId" TEXT,
  ADD COLUMN "birthCertificateNo" TEXT,
  ADD COLUMN "religion" TEXT,
  ADD COLUMN "maritalStatus" TEXT,
  ADD COLUMN "nationality" TEXT,
  ADD COLUMN "fatherName" TEXT,
  ADD COLUMN "motherName" TEXT,
  ADD COLUMN "emergencyContactName" TEXT,
  ADD COLUMN "emergencyContactPhone" TEXT,
  ADD COLUMN "employmentType" TEXT,
  ADD COLUMN "institution" TEXT,
  ADD COLUMN "passingYear" TEXT,
  ADD COLUMN "result" TEXT,
  ADD COLUMN "previousOrganization" TEXT,
  ADD COLUMN "previousDesignation" TEXT,
  ADD COLUMN "expectedSalary" DOUBLE PRECISION,
  ADD COLUMN "resumeUrl" TEXT,
  ADD COLUMN "nidUrl" TEXT,
  ADD COLUMN "birthCertUrl" TEXT,
  ADD COLUMN "coverLetter" TEXT;

-- CreateIndex
CREATE INDEX "Teacher_departmentId_idx" ON "Teacher"("departmentId");
