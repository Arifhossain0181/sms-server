export type AdmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'O_POS' | 'O_NEG' | 'AB_POS' | 'AB_NEG';

// ─── Apply for admission (public form) ──────────────────────────────
export interface CreateAdmissionDto {
  applicantName: string;
  dob: string; // ISO date string
  gender: Gender;
  religion?: string;
  bloodGroup?: BloodGroup;
  address: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  targetClassId: string;
  photoUrl?: string;
  birthCertUrl?: string;
}

// ─── Admin: review & update status ──────────────────────────────────
export interface UpdateAdmissionStatusDto {
  status: AdmissionStatus;
  rejectionReason?: string;
}

export interface UpdateAdmissionDto {
  applicantName?: string;
  dob?: string;
  gender?: Gender;
  religion?: string;
  bloodGroup?: BloodGroup;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  targetClassId?: string;
  photoUrl?: string;
  birthCertUrl?: string;
}

// ─── Convert approved admission → Student account ───────────────────
export interface ConvertToStudentDto {
  admissionId: string;
  email: string;
  password: string;
  rollNumber: string;
}

// ─── Query / filter ─────────────────────────────────────────────────
export interface AdmissionQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  status?: AdmissionStatus;
  classId?: string;
}