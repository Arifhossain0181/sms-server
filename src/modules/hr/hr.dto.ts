export interface CreateStaffDto {
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  designation?: string;
  departmentId?: string;
  staffType?: 'TEACHING' | 'NON_TEACHING';
  qualification?: string;
  experience?: number;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  bloodGroup?: string;
  joiningDate?: string;
  idProofUrl?: string;
  certificates?: string[];
  contractUrl?: string;
  reportingTo?: string;
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  phone?: string;
  designation?: string;
  departmentId?: string;
  staffType?: 'TEACHING' | 'NON_TEACHING';
  qualification?: string;
  experience?: number;
  address?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string;
  bloodGroup?: string;
  joiningDate?: string;
  photo?: string;
  idProofUrl?: string;
  certificates?: string[];
  contractUrl?: string;
  reportingTo?: string;
  isActive?: boolean;
}

export interface StaffQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  departmentId?: string;
  designation?: string;
  staffType?: string;
  isActive?: string;
}

export interface CreateDepartmentDto {
  name: string;
  code?: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreateAttendanceDto {
  staffId: string;
  date: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE';
  note?: string;
}

export interface BulkAttendanceDto {
  date: string;
  attendances: Array<{ staffId: string; status: 'PRESENT' | 'ABSENT' | 'LATE'; note?: string }>;
}

export interface CreateLeaveDto {
  staffId: string;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED' | 'MATERNITY' | 'PATERNITY';
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ApproveLeaveDto {
  approved: boolean;
  rejectionReason?: string;
}

export interface UpdateLeaveBalanceDto {
  totalDays: number;
}

export interface CreatePayrollDto {
  staffId: string;
  month: number;
  year: number;
  basicPay: number;
  allowances?: number;
  deductions?: number;
}

export interface CreatePerformanceReviewDto {
  staffId: string;
  reviewDate: string;
  rating: 'EXCELLENT' | 'GOOD' | 'SATISFACTORY' | 'NEEDS_IMPROVEMENT' | 'POOR';
  strengths?: string;
  areasToImprove?: string;
  comments?: string;
}

export interface CreateCriticalActionDto {
  actionType: string;
  staffId: string;
  staffName: string;
  reason: string;
  details?: Record<string, any>;
}
