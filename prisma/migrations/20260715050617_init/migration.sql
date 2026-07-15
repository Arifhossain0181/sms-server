/*
  Warnings:

  - The values [ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `FeeStructure` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Invoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `TimetableSlot` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[classId,feeType,studentId,year,month]` on the table `FeeStructure` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noticeId,studentId]` on the table `NoticeRecipient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noticeId,parentId]` on the table `NoticeRecipient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[noticeId,userId]` on the table `NoticeRecipient` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code,classId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Made the column `studentEmail` on table `AdmissionApplication` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `month` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `FeeStructure` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ADMISSION', 'FEE', 'EXAM', 'RESULT', 'ATTENDANCE', 'NOTICE', 'TIMETABLE', 'GENERAL');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'ACCOUNTANT', 'TEACHER', 'STUDENT', 'PARENT', 'EXAM_CONTROLLER', 'HR');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "TimetableSlot" DROP CONSTRAINT "TimetableSlot_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "TimetableSlot" DROP CONSTRAINT "TimetableSlot_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "TimetableSlot" DROP CONSTRAINT "TimetableSlot_teacherId_fkey";

-- AlterTable
ALTER TABLE "AdmissionApplication" ALTER COLUMN "studentEmail" SET NOT NULL;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "totalMarks" INTEGER;

-- AlterTable
ALTER TABLE "FeeStructure" ADD COLUMN     "description" TEXT,
ADD COLUMN     "month" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "year" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "FeeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "status",
ADD COLUMN     "status" "FeeStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "NoticeRecipient" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "relation" TEXT;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "department" TEXT,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "salary" DOUBLE PRECISION;

-- DropTable
DROP TABLE "TimetableSlot";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "referenceId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timetable" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "dayOfWeek" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roomNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_type_idx" ON "Notification"("userId", "type");

-- CreateIndex
CREATE INDEX "Timetable_classId_idx" ON "Timetable"("classId");

-- CreateIndex
CREATE INDEX "Timetable_sectionId_idx" ON "Timetable"("sectionId");

-- CreateIndex
CREATE INDEX "Timetable_subjectId_idx" ON "Timetable"("subjectId");

-- CreateIndex
CREATE INDEX "Timetable_teacherId_dayOfWeek_idx" ON "Timetable"("teacherId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "Timetable_classId_dayOfWeek_idx" ON "Timetable"("classId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_teacherId_dayOfWeek_startTime_key" ON "Timetable"("teacherId", "dayOfWeek", "startTime");

-- CreateIndex
CREATE INDEX "AdmissionApplication_status_idx" ON "AdmissionApplication"("status");

-- CreateIndex
CREATE INDEX "AdmissionApplication_targetClassId_idx" ON "AdmissionApplication"("targetClassId");

-- CreateIndex
CREATE INDEX "AdmissionApplication_guardianEmail_idx" ON "AdmissionApplication"("guardianEmail");

-- CreateIndex
CREATE INDEX "AdmissionApplication_createdAt_idx" ON "AdmissionApplication"("createdAt");

-- CreateIndex
CREATE INDEX "AdmissionApplication_status_targetClassId_idx" ON "AdmissionApplication"("status", "targetClassId");

-- CreateIndex
CREATE INDEX "FeeStructure_studentId_status_idx" ON "FeeStructure"("studentId", "status");

-- CreateIndex
CREATE INDEX "FeeStructure_classId_status_idx" ON "FeeStructure"("classId", "status");

-- CreateIndex
CREATE INDEX "FeeStructure_status_dueDate_idx" ON "FeeStructure"("status", "dueDate");

-- CreateIndex
CREATE INDEX "FeeStructure_dueDate_idx" ON "FeeStructure"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructure_classId_feeType_studentId_year_month_key" ON "FeeStructure"("classId", "feeType", "studentId", "year", "month");

-- CreateIndex
CREATE INDEX "Mark_studentId_idx" ON "Mark"("studentId");

-- CreateIndex
CREATE INDEX "Mark_studentId_examId_idx" ON "Mark"("studentId", "examId");

-- CreateIndex
CREATE INDEX "Mark_examId_idx" ON "Mark"("examId");

-- CreateIndex
CREATE INDEX "Notice_audience_isActive_publishedAt_idx" ON "Notice"("audience", "isActive", "publishedAt");

-- CreateIndex
CREATE INDEX "NoticeRecipient_studentId_isRead_idx" ON "NoticeRecipient"("studentId", "isRead");

-- CreateIndex
CREATE INDEX "NoticeRecipient_parentId_isRead_idx" ON "NoticeRecipient"("parentId", "isRead");

-- CreateIndex
CREATE INDEX "NoticeRecipient_userId_isRead_idx" ON "NoticeRecipient"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRecipient_noticeId_studentId_key" ON "NoticeRecipient"("noticeId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRecipient_noticeId_parentId_key" ON "NoticeRecipient"("noticeId", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "NoticeRecipient_noticeId_userId_key" ON "NoticeRecipient"("noticeId", "userId");

-- CreateIndex
CREATE INDEX "Student_classId_idx" ON "Student"("classId");

-- CreateIndex
CREATE INDEX "Student_parentId_idx" ON "Student"("parentId");

-- CreateIndex
CREATE INDEX "StudentAttendance_studentId_idx" ON "StudentAttendance"("studentId");

-- CreateIndex
CREATE INDEX "StudentAttendance_studentId_date_idx" ON "StudentAttendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "StudentAttendance_sectionId_date_idx" ON "StudentAttendance"("sectionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_classId_key" ON "Subject"("code", "classId");

-- CreateIndex
CREATE INDEX "Teacher_employeeId_idx" ON "Teacher"("employeeId");

-- AddForeignKey
ALTER TABLE "NoticeRecipient" ADD CONSTRAINT "NoticeRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetable" ADD CONSTRAINT "Timetable_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
