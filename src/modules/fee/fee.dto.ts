import { FeeStatus, FeeType as PrismaFeeType, PaymentMethod } from "@prisma/client"; // Ensure correct imports for FeeStatus and PrismaFeeType

export type FeeType = PrismaFeeType; // Use Prisma-generated FeeType

// ─── Create / Update ────────────────────────────────────────────────
export interface CreateFeeDto {
  studentId: string;
  classId: string; // Added classId
  title: string;
  type: FeeType; // Updated to use Prisma FeeType
  amount: number;
  dueDate: string; // ISO date
  dueDay: number; // Added dueDay
  description?: string;
}

export interface UpdateFeeDto {
  title?: string;
  amount?: number;
  dueDate?: string;
  description?: string;
  status?: FeeStatus;
}

// ─── Bulk assign same fee to entire class ───────────────────────────
export interface BulkCreateFeeDto {
  classId: string;
  title: string;
  type: FeeType;
  amount: number;
  dueDate: string;
  description?: string;
}

// ─── Record a payment ───────────────────────────────────────────────
export interface RecordPaymentDto {
  feeId: string;
  amountPaid: number;
  method: PaymentMethod;
  transactionId?: string;
  note?: string;
}

// ─── Query / filter ─────────────────────────────────────────────────
export interface FeeQueryDto {
  page?: string;
  limit?: string;
  studentId?: string;
  classId?: string;
  type?: FeeType;
  status?: FeeStatus;
  month?: string; // e.g. "2024-09"
}