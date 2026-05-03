/*
  Warnings:

  - You are about to drop the column `body` on the `Notice` table. All the data in the column will be lost.
  - You are about to drop the column `isPinned` on the `Notice` table. All the data in the column will be lost.
  - You are about to drop the column `isSchoolWide` on the `Notice` table. All the data in the column will be lost.
  - You are about to drop the column `publishedBy` on the `Notice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `audience` to the `Notice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `Notice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Notice` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "NoticeAudience" AS ENUM ('ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'STAFF');

-- CreateEnum
CREATE TYPE "NoticePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Notice" DROP COLUMN "body",
DROP COLUMN "isPinned",
DROP COLUMN "isSchoolWide",
DROP COLUMN "publishedBy",
ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "audience" "NoticeAudience" NOT NULL,
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priority" "NoticePriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "note" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_transactionId_key" ON "Payment"("transactionId");

-- AddForeignKey
ALTER TABLE "Notice" ADD CONSTRAINT "Notice_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
