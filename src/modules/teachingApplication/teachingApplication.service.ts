import prisma from "../../config/db";
import { CreateTeachingApplicationDto, UpdateTeachingApplicationStatusDto } from "./teachingApplication.dto";
import { TeachersService } from "../teachers/teachers.service";
import { randomBytes } from "node:crypto";

export const applyForTeaching = async (dto: CreateTeachingApplicationDto) => {
  const existing = await prisma.teachingApplication.findFirst({
    where: {
      email: dto.email,
      status: "PENDING",
    },
  });

  if (existing) {
    throw new Error("An application with this email is already pending");
  }

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
  });
};

export const listTeachingApplications = async () => {
  return prisma.teachingApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getTeachingApplicationById = async (id: string) => {
  const application = await prisma.teachingApplication.findUnique({
    where: { id },
  });
  if (!application) throw { status: 404, message: "Application not found" };
  return application;
};

export const updateTeachingApplicationStatus = async (
  id: string,
  dto: UpdateTeachingApplicationStatusDto
) => {
  const application = await getTeachingApplicationById(id);

  if (dto.status === "APPROVED" && application.status !== "APPROVED") {
    const existingTeacher = await prisma.teacher.findFirst({
      where: { email: application.email },
      select: { id: true },
    });

    if (!existingTeacher) {
      const generatedId = `TCH-${randomBytes(3).toString("hex")}`.toUpperCase();
      await TeachersService.create({
        name: application.name,
        email: application.email,
        TeachersId: generatedId,
        designation: application.designation,
        department: application.department ?? undefined,
        qualification: application.qualification,
        experience: application.experience,
        phone: application.phone,
        address: application.address,
        gender: application.gender,
        dateOfBirth: application.dob.toISOString().split("T")[0],
        dateOfJoining: new Date().toISOString().split("T")[0],
        salary: application.expectedSalary ?? undefined,
      });
    }
  }

  return prisma.teachingApplication.update({
    where: { id },
    data: {
      status: dto.status,
      rejectionReason: dto.rejectionReason,
      reviewedAt: new Date(),
    },
  });
};
