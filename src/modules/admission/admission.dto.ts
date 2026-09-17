export type AdmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'O_POS' | 'O_NEG' | 'AB_POS' | 'AB_NEG';
export type GuardianRelation = 'FATHER' | 'MOTHER' | 'OTHER';

export const isValidGmailAddress = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9][a-z0-9._%+-]*@gmail\.com$/i.test(value.trim());

// ─── Apply for admission (public form) ──────────────────────────────
export interface CreateAdmissionDto {
  applicantName: string;
  studentEmail: string;
  studentPhone: string;
  dob: string; // ISO date string
  gender: Gender;
  religion?: string;
  bloodGroup?: BloodGroup;
  address: string;
  presentHouseRoad?: string;
  presentArea?: string;
  presentCity?: string;
  presentDistrict?: string;
  presentPostalCode?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation: GuardianRelation;
  fatherFullName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherNid?: string;
  fatherOccupation?: string;
  fatherOrganization?: string;
  fatherDesignation?: string;
  fatherIncome?: string;
  fatherAddress?: string;
  fatherPhotoUrl?: string;
  motherFullName?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherNid?: string;
  motherOccupation?: string;
  motherOrganization?: string;
  motherDesignation?: string;
  motherIncome?: string;
  motherAddress?: string;
  motherPhotoUrl?: string;
  targetClassId: string;
  photoUrl?: string;
  birthCertUrl?: string;
  guardianNidUrl?: string;
  paymentMethod?: 'CASH' | 'STRIPE';
  paymentAmount?: number;
  transactionId?: string;
}

// ─── Admin: review & update status ──────────────────────────────────
export interface UpdateAdmissionStatusDto {
  status: AdmissionStatus;
  rejectionReason?: string;
}

export interface UpdateAdmissionDto {
  applicantName?: string;
  studentEmail?: string;
  studentPhone?: string;
  dob?: string;
  gender?: Gender;
  religion?: string;
  bloodGroup?: BloodGroup;
  address?: string;
  presentHouseRoad?: string;
  presentArea?: string;
  presentCity?: string;
  presentDistrict?: string;
  presentPostalCode?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianRelation?: GuardianRelation;
  fatherFullName?: string;
  fatherPhone?: string;
  fatherEmail?: string;
  fatherNid?: string;
  fatherOccupation?: string;
  fatherOrganization?: string;
  fatherDesignation?: string;
  fatherIncome?: string;
  fatherAddress?: string;
  fatherPhotoUrl?: string;
  motherFullName?: string;
  motherPhone?: string;
  motherEmail?: string;
  motherNid?: string;
  motherOccupation?: string;
  motherOrganization?: string;
  motherDesignation?: string;
  motherIncome?: string;
  motherAddress?: string;
  motherPhotoUrl?: string;
  targetClassId?: string;
  photoUrl?: string;
  birthCertUrl?: string;
  guardianNidUrl?: string;
}

// ─── Convert approved admission → Student account ───────────────────
export interface ConvertToStudentDto {
  admissionId: string;
}

// ─── Query / filter ─────────────────────────────────────────────────
export interface AdmissionQueryDto {
  page?: string;
  limit?: string;
  search?: string;
  status?: AdmissionStatus;
  classId?: string;
}
