-- AlterTable
ALTER TABLE "AdmissionApplication" ADD COLUMN     "paymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" "PaymentMethod",
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT;
