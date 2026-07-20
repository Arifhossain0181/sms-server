import {
  CreateJobPostingDto,
  UpdateJobPostingDto,
  CreateApplicantDto,
  UpdateApplicantStatusDto,
  CreateInterviewDto,
  UpdateInterviewDto,
  CreateOfferDto,
  CreateDesignationSalaryDto,
} from './recruitment.dto';
import prisma from '../../config/db';
import { paginate } from '../../utils/pagination.util';

// ─── Job Posting helpers 

export async function createJobPosting(dto: CreateJobPostingDto, actorId: string) {
  return prisma.jobPosting.create({
    data: {
      title: dto.title,
      departmentId: dto.departmentId,
      designation: dto.designation,
      vacancies: dto.vacancies,
      description: dto.description,
      requirements: dto.requirements,
      deadline: new Date(dto.deadline),
      createdBy: actorId,
    },
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function findAllJobPostings(query: any) {
  const { page = '1', limit = '10', status, departmentId } = query;

  const where: any = {};
  if (status) where.status = status;
  if (departmentId) where.departmentId = departmentId;

  const { skip, take, meta } = await paginate(prisma.jobPosting, where, parseInt(page, 10), parseInt(limit, 10));

  const [postings, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      skip,
      take,
      include: {
        department: { select: { id: true, name: true, code: true } },
        applicants: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.jobPosting.count({ where }),
  ]);

  return {
    postings: postings.map((p) => ({
      ...p,
      applicantCount: p.applicants.length,
      applicants: undefined,
    })),
    meta: { ...meta, total },
  };
}

export async function findJobPostingById(id: string) {
  const posting = await prisma.jobPosting.findUnique({
    where: { id },
    include: {
      department: { select: { id: true, name: true, code: true } },
      applicants: {
        include: {
          interviews: true,
          offers: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!posting) throw { status: 404, message: 'Job posting not found' };
  return posting;
}

export async function updateJobPosting(id: string, dto: UpdateJobPostingDto) {
  const posting = await prisma.jobPosting.findUnique({ where: { id } });
  if (!posting) throw { status: 404, message: 'Job posting not found' };

  const data: any = { ...dto };
  if (dto.deadline) {
    data.deadline = new Date(dto.deadline);
  }

  return prisma.jobPosting.update({
    where: { id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function closeJobPosting(id: string) {
  const posting = await prisma.jobPosting.findUnique({ where: { id } });
  if (!posting) throw { status: 404, message: 'Job posting not found' };

  return prisma.jobPosting.update({
    where: { id },
    data: { status: 'CLOSED' },
  });
}

// ─── Applicant helpers 

export async function createApplicant(dto: CreateApplicantDto) {
  const posting = await prisma.jobPosting.findUnique({ where: { id: dto.jobPostingId } });
  if (!posting) throw { status: 404, message: 'Job posting not found' };

  return prisma.applicant.create({
    data: {
      jobPostingId: dto.jobPostingId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
      notes: dto.notes,
    },
    include: {
      jobPosting: { select: { id: true, title: true, designation: true } },
    },
  });
}

export async function findAllApplicants(query: any) {
  const { page = '1', limit = '10', jobPostingId, status } = query;

  const where: any = {};
  if (jobPostingId) where.jobPostingId = jobPostingId;
  if (status) where.status = status;

  const { skip, take, meta } = await paginate(prisma.applicant, where, parseInt(page, 10), parseInt(limit, 10));

  const [applicants, total] = await Promise.all([
    prisma.applicant.findMany({
      where,
      skip,
      take,
      include: {
        jobPosting: { select: { id: true, title: true, designation: true } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
        offers: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.applicant.count({ where }),
  ]);

  return { applicants, meta: { ...meta, total } };
}

export async function updateApplicantStatus(id: string, dto: UpdateApplicantStatusDto) {
  const applicant = await prisma.applicant.findUnique({ where: { id } });
  if (!applicant) throw { status: 404, message: 'Applicant not found' };

  return prisma.applicant.update({
    where: { id },
    data: { status: dto.status },
    include: { jobPosting: { select: { id: true, title: true } } },
  });
}

export async function findApplicantById(id: string) {
  const applicant = await prisma.applicant.findUnique({
    where: { id },
    include: {
      jobPosting: { select: { id: true, title: true, designation: true, department: { select: { id: true, name: true } } } },
      interviews: { orderBy: { scheduledAt: 'desc' } },
      offers: true,
    },
  });

  if (!applicant) throw { status: 404, message: 'Applicant not found' };
  return applicant;
}

// ─── Interview helpers 

export async function createInterview(dto: CreateInterviewDto) {
  const applicant = await prisma.applicant.findUnique({ where: { id: dto.applicantId } });
  if (!applicant) throw { status: 404, message: 'Applicant not found' };

  return prisma.interview.create({
    data: {
      applicantId: dto.applicantId,
      scheduledAt: new Date(dto.scheduledAt),
      location: dto.location,
      interviewers: dto.interviewers ?? [],
    },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } },
        },
      },
    },
  });
}

export async function updateInterview(id: string, dto: UpdateInterviewDto) {
  const interview = await prisma.interview.findUnique({ where: { id } });
  if (!interview) throw { status: 404, message: 'Interview not found' };

  const data: any = { ...dto };
  if (dto.scheduledAt) {
    data.scheduledAt = new Date(dto.scheduledAt);
  }

  return prisma.interview.update({
    where: { id },
    data,
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } },
        },
      },
    },
  });
}

// ─── Offer helpers 

export async function createOffer(dto: CreateOfferDto) {
  const applicant = await prisma.applicant.findUnique({ where: { id: dto.applicantId } });
  if (!applicant) throw { status: 404, message: 'Applicant not found' };

  return prisma.offer.create({
    data: {
      applicantId: dto.applicantId,
      position: dto.position,
      departmentId: dto.departmentId,
      salary: dto.salary,
      joiningDate: new Date(dto.joiningDate),
      validUntil: new Date(dto.validUntil),
      terms: dto.terms,
    },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true } },
        },
      },
    },
  });
}

export async function findOfferById(id: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      applicant: {
        select: {
          id: true,
          name: true,
          email: true,
          jobPosting: { select: { id: true, title: true, designation: true, department: { select: { id: true, name: true } } } },
        },
      },
    },
  });

  if (!offer) throw { status: 404, message: 'Offer not found' };
  return offer;
}

export async function acceptOffer(id: string) {
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { applicant: true },
  });

  if (!offer) throw { status: 404, message: 'Offer not found' };
  if (offer.status === 'ACCEPTED') throw { status: 400, message: 'Offer already accepted' };

  const updatedOffer = await prisma.offer.update({
    where: { id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
  });

  await prisma.applicant.update({
    where: { id: offer.applicantId },
    data: { status: 'ACCEPTED' },
  });

  await prisma.jobPosting.update({
    where: { id: offer.applicant.jobPostingId },
    data: { status: 'FILLED' },
  });

  return updatedOffer;
}

export async function rejectOffer(id: string) {
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) throw { status: 404, message: 'Offer not found' };

  return prisma.offer.update({
    where: { id },
    data: { status: 'DECLINED' },
  });
}

// ─── Designation Salary helpers 

export async function createDesignationSalary(dto: CreateDesignationSalaryDto) {
  return prisma.designationSalary.create({
    data: {
      designation: dto.designation,
      departmentId: dto.departmentId,
      basicPay: dto.basicPay,
      allowances: dto.allowances ?? 0,
      deductions: dto.deductions ?? 0,
    },
    include: { department: { select: { id: true, name: true } } },
  });
}

export async function findAllDesignationSalaries() {
  return prisma.designationSalary.findMany({
    include: { department: { select: { id: true, name: true, code: true } } },
    orderBy: { designation: 'asc' },
  });
}

export async function getDesignationSalary(designation: string) {
  return prisma.designationSalary.findFirst({
    where: { designation: { equals: designation, mode: 'insensitive' } },
    include: { department: { select: { id: true, name: true } } },
  });
}

// ─── Dashboard 

export async function getRecruitmentDashboardStats() {
  const [totalPostings, openPostings, totalApplicants, shortlisted, offersSent, offersAccepted] =
    await Promise.all([
      prisma.jobPosting.count(),
      prisma.jobPosting.count({ where: { status: 'OPEN' } }),
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: 'SHORTLISTED' } }),
      prisma.applicant.count({ where: { status: 'OFFERED' } }),
      prisma.applicant.count({ where: { status: 'ACCEPTED' } }),
    ]);

  return {
    totalPostings,
    openPostings,
    totalApplicants,
    shortlisted,
    offersSent,
    offersAccepted,
  };
}
