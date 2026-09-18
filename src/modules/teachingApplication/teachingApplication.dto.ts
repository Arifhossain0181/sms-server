import { TeachingApplicationStatus } from "@prisma/client";

export interface CreateTeachingApplicationDto {
  name: string;
  email: string;
  phone: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dob: string;
  address: string;
  designation: string;
  department?: string;
  qualification: string;
  experience: number;
  subjectSpecialization?: string;
  expectedSalary?: number;
  resumeUrl?: string;
  coverLetter?: string;

  // New fields
  nationalId?: string;
  birthCertificateNo?: string;
  religion?: string;
  maritalStatus?: string;
  nationality?: string;
  fatherName?: string;
  motherName?: string;
  employmentType?: string;
  presentAddress?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  photoUrl?: string;
  cvUrl?: string;
  nidUrl?: string;
  birthCertUrl?: string;
  sscCertUrl?: string;
  hscCertUrl?: string;
  bscCertUrl?: string;
  mscCertUrl?: string;
  institution?: string;
  passingYear?: string;
  result?: string;
  previousOrganization?: string;
  previousDesignation?: string;
}

export interface UpdateTeachingApplicationStatusDto {
  status: TeachingApplicationStatus;
  rejectionReason?: string; // required by the service when status === REJECTED
}

// ─── HR: list / filter applications (job-posting applicant tracking) ──
export interface ListTeachingApplicationsQueryDto {
  status?: TeachingApplicationStatus;
  search?: string; // matches name or email
  page?: number;
  pageSize?: number;
}

export type UpdateTeachingApplicationDto = Partial<CreateTeachingApplicationDto>;