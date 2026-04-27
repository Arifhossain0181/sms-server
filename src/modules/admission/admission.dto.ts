export type AdmissionStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';

// ─── Apply for admission (public form) ──────────────────────────────
export interface CreateAdmissionDto {
  // Applicant
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  bloodGroup?: BloodGroup;
  nationality?: string;
  religion?: string;
  previousSchool?: string;
  previousClass?: string;

  // Apply to
  applyingForClass: string;   // classId
  academicYear: string;       // e.g. "2024-2025"

  // Guardian
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianOccupation?: string;
  guardianAddress: string;

  // Documents (Cloudinary URLs)
  birthCertificateUrl?: string;
  transferCertificateUrl?: string;
  photoUrl?: string;
}

// ─── Admin: review & update status ──────────────────────────────────
export interface UpdateAdmissionStatusDto {
  status: AdmissionStatus;
  remarks?: string;            // reason for rejection / notes
}

export interface UpdateAdmissionDto {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  applyingForClass?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianAddress?: string;
  birthCertificateUrl?: string;
  transferCertificateUrl?: string;
  photoUrl?: string;
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
  academicYear?: string;
}