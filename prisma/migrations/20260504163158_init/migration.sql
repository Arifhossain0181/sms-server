-- CreateEnum
CREATE TYPE "TeachingApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "TeachingApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" DATE NOT NULL,
    "address" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "department" TEXT,
    "qualification" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "subjectSpecialization" TEXT,
    "expectedSalary" DOUBLE PRECISION,
    "resumeUrl" TEXT,
    "coverLetter" TEXT,
    "status" "TeachingApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeachingApplication_email_idx" ON "TeachingApplication"("email");
