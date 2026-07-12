import prisma from "../../config/db";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import {
  CreateTeachingApplicationDto,
  UpdateTeachingApplicationStatusDto,
  ListTeachingApplicationsQueryDto,
} from "./teachingApplication.dto";



const APPLICATION_SELECT = {
  id: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  dob: true,
  address: true,
  designation: true,
  department: true,
  qualification: true,
  experience: true,
  subjectSpecialization: true,
  expectedSalary: true,
  resumeUrl: true,
  coverLetter: true,
  status: true,
  reviewedAt: true,
  rejectionReason: true,
  createdAt: true,
} as const;

// ─── PUBLIC: submit a job application (no auth — open application form) ─
export const applyForTeaching = async (dto: CreateTeachingApplicationDto) => {
  // WHAT: block a second application while one is already pending, AND
  //       block applying with an email that's already an active teacher.
  const [pendingApplication, activeTeacher] = await Promise.all([
    prisma.teachingApplication.findFirst({ where: { email: dto.email, status: "PENDING" }, select: { id: true } }),
    prisma.teacher.findFirst({ where: { email: dto.email, isActive: true }, select: { id: true } }),
  ]);
  if (pendingApplication) throw new Error("An application with this email is already pending");
  if (activeTeacher) throw new Error("This email already belongs to an active teacher account");

  return prisma.teachingApplication.create({
    data: {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      gender: dto.gender,
      dob: new Date(dto.dob),
      address: dto.address,
      designation: dto.designation,
      department: dto.department,
      qualification: dto.qualification,
      experience: dto.experience,
      subjectSpecialization: dto.subjectSpecialization,
      expectedSalary: dto.expectedSalary,
      resumeUrl: dto.resumeUrl,
      coverLetter: dto.coverLetter,
    },
    select: APPLICATION_SELECT,
  });
};

// ─── HR: paginated, filterable applicant list ───────────────────────
export const listTeachingApplications = async (query: ListTeachingApplicationsQueryDto = {}) => {
  const page = query.page ?? 1;
  const pageSize = Math.min(query.pageSize ?? 20, 100);

  const where: any = {
    ...(query.status && { status: query.status }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, data] = await Promise.all([
    prisma.teachingApplication.count({ where }),
    prisma.teachingApplication.findMany({
      where,
      select: APPLICATION_SELECT,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
};

export const getTeachingApplicationById = async (id: string) => {
  const application = await prisma.teachingApplication.findUnique({ where: { id }, select: APPLICATION_SELECT });
  if (!application) throw { status: 404, message: "Application not found" };
  return application;
};

// ─── HR: approve or reject an application 
export const updateTeachingApplicationStatus = async (
  id: string,
  dto: UpdateTeachingApplicationStatusDto
) => {
  const application = await prisma.teachingApplication.findUnique({ where: { id } });
  if (!application) throw { status: 404, message: "Application not found" };

  // WHAT: same pattern as Admission rejections elsewhere in this
  //       system — a reason is mandatory so the decision is auditable.
  if (dto.status === "REJECTED" && !dto.rejectionReason) {
    throw new Error("A rejection reason is required");
  }

  // WHAT: nothing to create/link for rejections or re-processing an
  //       already-approved application — just record the decision.
  if (dto.status !== "APPROVED" || application.status === "APPROVED") {
    return prisma.teachingApplication.update({
      where: { id },
      data: { status: dto.status, rejectionReason: dto.rejectionReason, reviewedAt: new Date() },
      select: APPLICATION_SELECT,
    });
  }

  // ── APPROVAL PATH: one transaction, one field set, no branching ────
  let tempPassword: string | null = null;

  const result = await prisma.$transaction(async (tx) => {
    let user = await tx.user.findUnique({ where: { email: application.email }, select: { id: true, role: true } });

    if (!user) {
      // WHAT: generate + hash a temporary password for the new account.
      // WHY: the old "no existing user" path relied on TeachersService
      //      to somehow set a password — unverified and inconsistent.
      //      Generating it explicitly here means we know for certain
      //      every new teacher account has a usable, hashed password.
      tempPassword = randomBytes(6).toString("base64url"); // e.g. "kQ2f9xLp"
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      user = await tx.user.create({
        data: { name: application.name, email: application.email, passwordHash, role: "TEACHER" },
        select: { id: true, role: true },
      });
    } else if (user.role !== "TEACHER") {
      user = await tx.user.update({ where: { id: user.id }, data: { role: "TEACHER" }, select: { id: true, role: true } });
    }

    let teacher = await tx.teacher.findFirst({ where: { userId: user.id }, select: { id: true } });

    if (!teacher) {
      const employeeId = await _generateUniqueEmployeeId(tx);

      // WHAT: the ONE canonical field set — everything the application
      //       captured gets carried over, regardless of whether the
      //       user account already existed.
      teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          employeeId,
          name: application.name,
          email: application.email,
          phone: application.phone,
          gender: application.gender,
          address: application.address,
          designation: application.designation,
          department: application.department,
          qualification: application.qualification,
          experience: application.experience,
          subjectSpecialization: application.subjectSpecialization,
          salary: application.expectedSalary,
          dateOfBirth: application.dob,
          joiningDate: new Date(),
          isActive: true,
        },
        select: { id: true },
      });
    }

    const updatedApplication = await tx.teachingApplication.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date(), rejectionReason: null },
      select: APPLICATION_SELECT,
    });

    return { application: updatedApplication, teacherId: teacher.id, isNewAccount: !!tempPassword };
  });

  // WHAT: temp password is returned ONCE to the caller (HR controller
  //       decides whether to email it or show it in the response) —
  //       it is never persisted or logged anywhere.
  return { ...result, tempPassword };
};

// ─── PRIVATE HELPERS 

async function _generateUniqueEmployeeId(tx: any): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = `TCH-${randomBytes(3).toString("hex")}`.toUpperCase();
    const clash = await tx.teacher.findFirst({ where: { employeeId: candidate }, select: { id: true } });
    if (!clash) return candidate;
  }
  throw new Error("Could not generate a unique employee ID, please retry");
}