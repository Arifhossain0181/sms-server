export interface CreateJobPostingDto {
  title: string;
  departmentId?: string;
  designation: string;
  vacancies: number;
  description?: string;
  requirements?: string;
  deadline: string;
}

export interface UpdateJobPostingDto {
  title?: string;
  departmentId?: string;
  designation?: string;
  vacancies?: number;
  description?: string;
  requirements?: string;
  deadline?: string;
  status?: 'OPEN' | 'CLOSED' | 'FILLED';
}

export interface CreateApplicantDto {
  jobPostingId: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
}

export interface UpdateApplicantStatusDto {
  status: 'APPLIED' | 'SHORTLISTED' | 'REJECTED' | 'OFFERED' | 'ACCEPTED' | 'DECLINED';
}

export interface CreateInterviewDto {
  applicantId: string;
  scheduledAt: string;
  location?: string;
  interviewers?: string[];
}

export interface UpdateInterviewDto {
  scheduledAt?: string;
  location?: string;
  interviewers?: string[];
  status?: string;
  outcome?: string;
  score?: number;
  feedback?: string;
}

export interface CreateOfferDto {
  applicantId: string;
  position: string;
  departmentId?: string;
  salary: number;
  joiningDate: string;
  validUntil: string;
  terms?: string;
}

export interface CreateDesignationSalaryDto {
  designation: string;
  departmentId?: string;
  basicPay: number;
  allowances?: number;
  deductions?: number;
}
