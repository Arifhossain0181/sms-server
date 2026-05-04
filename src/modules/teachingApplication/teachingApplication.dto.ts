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
}

export interface UpdateTeachingApplicationStatusDto {
  status: TeachingApplicationStatus;
  rejectionReason?: string;
}
