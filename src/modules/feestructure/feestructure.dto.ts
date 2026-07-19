export type FeeType = 'TUITION' | 'ADMISSION' | 'EXAM';


export interface CreateFeeStructureDto {
  classId: string;
  feeType: FeeType;
  amount: number;
  dueDay: number;
  month: number;
  year: number;
  dueDate: Date;
  academicYear: string;
}

export interface UpdateFeeStructureDto {
  amount?: number;
  dueDay?: number;
}

// ─── list / filter 
export interface FeeStructureQueryDto {
  classId?: string;
  feeType?: FeeType;
  month?: number;
  year?: number;
  academicYear?: string;
  page?: number;
  pageSize?: number;
}