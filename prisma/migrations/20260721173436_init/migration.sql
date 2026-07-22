-- DropForeignKey
ALTER TABLE "applicants" DROP CONSTRAINT "applicants_jobPostingId_fkey";

-- DropForeignKey
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "leave_balances" DROP CONSTRAINT "leave_balances_staffId_fkey";

-- DropForeignKey
ALTER TABLE "leaves" DROP CONSTRAINT "leaves_staffId_fkey";

-- DropForeignKey
ALTER TABLE "offers" DROP CONSTRAINT "offers_applicantId_fkey";

-- DropForeignKey
ALTER TABLE "payrolls" DROP CONSTRAINT "payrolls_staffId_fkey";

-- DropForeignKey
ALTER TABLE "performance_reviews" DROP CONSTRAINT "performance_reviews_staffId_fkey";

-- DropForeignKey
ALTER TABLE "staff_attendances" DROP CONSTRAINT "staff_attendances_staffId_fkey";

-- AlterTable
ALTER TABLE "applicants" ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "critical_actions" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "departments" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "designation_salaries" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "job_postings" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "leave_balances" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "leaves" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "offers" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payrolls" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "performance_reviews" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "staff_attendances" ALTER COLUMN "id" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "applicants_jobPostingId_status_idx" ON "applicants"("jobPostingId", "status");

-- CreateIndex
CREATE INDEX "designation_salaries_designation_idx" ON "designation_salaries"("designation");

-- CreateIndex
CREATE INDEX "interviews_applicantId_idx" ON "interviews"("applicantId");

-- CreateIndex
CREATE INDEX "job_postings_status_deadline_idx" ON "job_postings"("status", "deadline");

-- CreateIndex
CREATE INDEX "offers_applicantId_idx" ON "offers"("applicantId");

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_jobPostingId_fkey" FOREIGN KEY ("jobPostingId") REFERENCES "job_postings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicants" ADD CONSTRAINT "applicants_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leaves" ADD CONSTRAINT "leaves_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "applicants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_attendances" ADD CONSTRAINT "staff_attendances_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
